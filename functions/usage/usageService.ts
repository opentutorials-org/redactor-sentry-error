// services/usageService.ts
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/database.types';
import { usageLogger } from '@/debug/usage';
import { intervalToMilliseconds } from '@/functions/usage/intervalToMilliseconds';
import { fetchSubscriberData } from '@/app/api/usage/webhook/fetchSubscriberData';
import {
    DEFAULT_RESET_QUANTITY,
    FREE_PLAN_USAGE_LIMIT,
    SUBSCRIPTION_USAGE_LIMIT,
} from '../constants';
import { fetchUserId } from '@/supabase/utils/client';
import { addBreadcrumb, captureException, captureMessage } from '@sentry/nextjs';
import { authLogger } from '@/debug/auth';
import dayjs from 'dayjs';

type PlanType = 'MONTHLY' | 'YEARLY' | 'FREE';
type StoreType = 'play_store' | 'app_store' | 'stripe' | null;
type SubscriptionStatus =
    | 'ACTIVE'
    | 'INACTIVE_FREE_USAGE_EXCEEDED'
    | 'INACTIVE_SUBSCRIPTION_USAGE_EXCEEDED';

export class UsageService {
    private supabase: SupabaseClient<Database>;
    private interval: string;
    private intervalMs: number;
    private requestId?: string;
    constructor(supabaseClient: SupabaseClient<Database>, requestId: string = '') {
        this.supabase = supabaseClient;
        // 사용량 초기화는 30일 간격으로 이루어집니다.
        // 월간/년간 결제 주기가 도래했을 때도 사용량 초기화가 이루어집니다.
        // 결제 주기와 사용량 초기화는 일치하지 않을 수 있습니다. 이 경우 사용량 초기화가 중복해서 발생할 수 있습니다. 사용자는 손실이 없습니다.
        this.interval = '30 days';
        this.intervalMs = intervalToMilliseconds(this.interval);
        this.requestId = requestId;
    }

    /**
     * 사용량 정보 가져오기
     */
    async fetchUsage(): Promise<Database['public']['Tables']['usage']['Row']> {
        usageLogger(this.requestId, '사용량 정보 가져오기 시작');

        const user_id = await fetchUserId();
        const { data: usageArray, error } = await this.supabase
            .from('usage')
            .select('*')
            .eq('user_id', user_id);

        if (error) {
            usageLogger(this.requestId, '사용량 정보를 가져오는 중 오류가 발생했습니다.', {
                error,
            });
            throw new Error('사용량 정보를 가져오는데 실패했습니다.', { cause: error });
        }

        const usage = usageArray ? usageArray[0] : null;

        if (!usage) {
            usageLogger(this.requestId, '사용량 데이터를 찾을 수 없습니다.');
            throw new Error('사용량 정보를 찾을 수 없습니다.', { cause: 'NO_DATA' });
        }

        usageLogger(this.requestId, '사용량 정보를 성공적으로 가져왔습니다.', { usage });

        // 상태에 따른 예외 처리
        if (
            ['INACTIVE_FREE_USAGE_EXCEEDED', 'INACTIVE_SUBSCRIPTION_USAGE_EXCEEDED'].includes(
                usage.status
            )
        ) {
            usageLogger(this.requestId, '사용량 한도를 초과했습니다.', { status: usage.status });
            const nextResetDate = dayjs(usage.next_reset_date);
            const formattedDate = nextResetDate.format('YYYY년 MM월 DD일');
            const daysRemaining = nextResetDate.diff(dayjs(), 'day');

            throw new Error(
                `월간 사용량이 초과되었습니다. 다음 초기화 일자: ${formattedDate} (${daysRemaining}일 남음)`,
                { cause: usage.status }
            );
        }

        if (usage.status === 'INACTIVE_EXPIRED_AUTO_RENEW_FAIL') {
            usageLogger(this.requestId, '구독 갱신에 실패했습니다.', { status: usage.status });
            throw new Error('구독 갱신에 실패했습니다. 결제 정보를 확인해주세요.', {
                cause: usage.status,
            });
        }

        return usage;
    }

    /**
     * 모든 사용자의 사용량 초기화
     */
    public async resetAll(): Promise<Record<string, number>> {
        usageLogger(this.requestId, 'resetUsageAll 호출');
        const now = new Date();

        usageLogger(
            this.requestId,
            `next_reset_date가 ${now.toISOString()} 이전인 사용자를 초기화합니다.`
        );
        const selectResult = await this.supabase
            .from('usage')
            .select('*')
            .lte('next_reset_date', now.toISOString())
            .limit(DEFAULT_RESET_QUANTITY);

        const results = {
            toFreeBecauseNoSubscription: 0,
            toFreeBecauseExpired: 0,
            toPremiumBecauseNotExpired: 0,
        };

        if (!selectResult.data || selectResult.data.length === 0) {
            usageLogger(this.requestId, '초기화할 사용자가 없습니다.');
            return results;
        }

        for (const row of selectResult.data) {
            await this.refreshSub(row.user_id, results);
        }

        return results;
    }

    public async checkFreePayToSub(userId: string): Promise<Record<string, number>> {
        usageLogger(
            this.requestId,
            `무료 사용자가 결제를 했는지 체크 후 유료 사용자로 업그레이드 처리 절차 시작 - checkFreePayToSub(${userId})`
        );

        // 1. userId와 일치하는 usage를 확인하고 plan_type이 FREE가 아니라면 종료
        const { data: usageArray, error } = await this.supabase
            .from('usage')
            .select('*')
            .eq('user_id', userId);

        if (error || !usageArray || usageArray.length === 0) {
            usageLogger(this.requestId, '사용량 정보를 가져오는데 실패했습니다.', { error });
            throw new Error('사용량 정보를 가져오는데 실패했습니다.', { cause: error });
        }

        const usage = usageArray[0];
        if (usage.plan_type !== 'FREE') {
            usageLogger(this.requestId, '사용자가 이미 유료 플랜을 사용 중입니다.');
            return {};
        }

        // 2. fetchSubscriberData를 조회해서 is_active가 아니라면 종료
        const subscriberData = await fetchSubscriberData(userId);
        if (!subscriberData.is_active) {
            usageLogger(this.requestId, '사용자가 활성 구독 상태가 아닙니다.');
            return {};
        }

        await this.updateToSub(userId, subscriberData);
        usageLogger(this.requestId, `사용자 ${userId}의 사용량 초기화 성공`);
        return {};
    }

    /**
     * 특정 사용자의 사용량 초기화
     */
    public async resetByUserId(userId: string): Promise<Record<string, number>> {
        usageLogger(this.requestId, `사용량 초기화 작업 시작 - resetUsageByUserId(${userId})`);
        const selectResult = await this.supabase.from('usage').select('*').eq('user_id', userId);

        //
        const results = {
            toFreeBecauseNoSubscription: 0,
            toFreeBecauseExpired: 0,
            toPremiumBecauseNotExpired: 0,
        };

        if (!selectResult.data || selectResult.data.length === 0) {
            usageLogger(this.requestId, '초기화할 사용자가 없습니다.');
            return results;
        }

        await this.refreshSub(selectResult.data[0].user_id, results);

        return results;
    }

    /**
     * 개별 사용자 사용량 초기화
     */
    private async refreshSub(user_id: string, results: Record<string, number>): Promise<void> {
        usageLogger(
            this.requestId,
            `resetUsageForUser 호출 - refreshUserSubscriptionStatus(${user_id})`
        );
        try {
            const subscriberAPI = await fetchSubscriberData(user_id);

            if (subscriberAPI.is_active) {
                await this.updateToSub(user_id, subscriberAPI);
                results.toPremiumBecauseNotExpired++;
            } else {
                usageLogger(
                    this.requestId,
                    `사용자 ${user_id}의 구독이 만료되었습니다. FREE로 초기화합니다.`
                );
                await this.setToFree(user_id);
                results.toFreeBecauseExpired++;
            }
        } catch (error) {
            usageLogger(
                this.requestId,
                `사용자 ${user_id}의 사용량 초기화 중 에러 발생: ${(error as Error).message}`
            );
        }
    }

    /**
     * 사용량 FREE 상태로 업데이트
     */
    public async setToFree(userId: string): Promise<void> {
        const now = new Date();
        const nextResetDate = new Date(now.getTime() + this.intervalMs);

        const userUsageUpdateData: Database['public']['Tables']['usage']['Row'] = {
            store: null,
            plan_type: 'FREE',
            last_reset_date: now.toISOString(),
            next_reset_date: nextResetDate.toISOString(),
            current_quota: 0.0,
            status: 'ACTIVE',
            premium_expires_date: null,
            premium_grace_period_expires_date: null,
            premium_product_identifier: null,
            premium_purchase_date: null,
            data: null,
            premium_product_plan_identifier: null,
            is_subscription_canceled: false,
            is_subscription_paused: false,
            user_id: userId,
            management_url: null,
        };

        const { data, error } = await this.supabase
            .from('usage')
            .update(userUsageUpdateData)
            .eq('user_id', userId)
            .select();

        if (error) {
            usageLogger(
                this.requestId,
                `사용자 ${userId}의 FREE 상태 업데이트 실패: ${error.message}`
            );
            throw new Error(`사용자 ${userId}의 FREE 상태 업데이트 실패`);
        } else if (data.length === 0) {
            usageLogger(
                this.requestId,
                `사용자 ${userId}의 FREE 상태 업데이트 실패: 업데이트할 행이 없음`
            );
            throw new Error(`사용자 ${userId}의 FREE 상태 업데이트 실패: 업데이트할 행이 없음`);
        } else {
            usageLogger(this.requestId, `사용자 ${userId}의 FREE 상태 업데이트 성공`);
        }
    }

    /**
     * 사용량 업데이트 또는 삽입
     */
    public async updateToSub(appUserId: string, subscriberData: any): Promise<void> {
        usageLogger(
            this.requestId,
            `유료사용자 갱신 - updateUsageToSubscription(${appUserId}, subscriberData)`,
            subscriberData
        );

        const premium = subscriberData.subscriber.entitlements.premium;

        const productPlanIdentifier = premium.product_plan_identifier;
        const productIdentifier = premium.product_identifier;
        const { plan_type, store } = this.resolvePlanStore(
            productPlanIdentifier || productIdentifier
        );

        const status: 'ACTIVE' = 'ACTIVE';
        const now = new Date();
        const nextResetDate = new Date(now.getTime() + this.intervalMs);
        const lastResetDateUtc = now.toISOString(); // ISO 형식의 UTC 시간
        const nextResetDateUtc = nextResetDate.toISOString();

        const params = {
            user_id: appUserId,
            store,
            plan_type,
            status,
            premium_expires_date: premium.expires_date,
            premium_grace_period_expires_date: premium.grace_period_expires_date,
            premium_product_identifier: premium.product_identifier,
            premium_purchase_date: premium.purchase_date,
            data: JSON.stringify(subscriberData),
            premium_product_plan_identifier: premium.product_plan_identifier || null,
            last_reset_date: lastResetDateUtc,
            next_reset_date: nextResetDateUtc,
            current_quota: 0.0,
            is_subscription_canceled: false,
            is_subscription_paused: false,
            management_url: subscriberData.subscriber.management_url,
        };

        for (const key in params) {
            if (params[key as keyof typeof params] === undefined) {
                throw new Error(`params 객체의 키 ${key}에서 undefined 값이 발견되었습니다.`);
            }
        }

        try {
            const { error: updateError, data } = await this.supabase
                .from('usage')
                .update(params)
                .eq('user_id', params.user_id);

            if (updateError) {
                usageLogger(this.requestId, `유료 사용자 갱신 실패: ${updateError.message}`);
                throw updateError;
            } else {
                usageLogger(this.requestId, `유료 사용자 갱신 성공.`);
            }
        } catch (error) {
            usageLogger(this.requestId, `데이터베이스 작업 실패: ${(error as Error).message}`);
            throw new Error(`데이터베이스 작업 실패: ${(error as Error).message}`);
        }
    }

    /**
     * 플랜 타입과 스토어 결정
     */
    private resolvePlanStore(identifier: string): { plan_type: PlanType; store: StoreType } {
        if (identifier === 'web_1_monthly') {
            return { plan_type: 'MONTHLY', store: 'stripe' };
        } else if (identifier === 'web_2_yearly') {
            return { plan_type: 'YEARLY', store: 'stripe' };
        } else if (identifier === '5-monthly') {
            return { plan_type: 'MONTHLY', store: 'play_store' };
        } else if (identifier === '6-yearly') {
            return { plan_type: 'YEARLY', store: 'play_store' };
        } else if (identifier === 'ios_monthly_subscription') {
            return { plan_type: 'MONTHLY', store: 'app_store' };
        } else if (identifier === 'ios_yearly_subscription') {
            return { plan_type: 'YEARLY', store: 'app_store' };
        }
        return { plan_type: 'FREE', store: null };
    }

    private async pauseSub(
        appUserId: string,
        statusKey: 'is_subscription_canceled' | 'is_subscription_paused' | 'premium_expires_date',
        statusValue: boolean | string,
        successMessage: string,
        inactiveErrorMessage: string
    ): Promise<void> {
        usageLogger(this.requestId, `사용자 ${appUserId}의 구독 상태를 업데이트합니다.`);

        try {
            const subscriberData = await fetchSubscriberData(appUserId);

            if (!subscriberData.is_active && statusValue) {
                usageLogger(this.requestId, inactiveErrorMessage);
                captureException(
                    new Error(`${inactiveErrorMessage} 이 문제가 자주 발생한다면 조사하십시오.`)
                );
                return;
            }

            const { data, error } = await this.supabase
                .from('usage')
                .update({
                    [statusKey]: statusValue,
                    data: JSON.stringify(subscriberData),
                })
                .eq('user_id', appUserId)
                .select()
                .single();

            if (error || !data) {
                throw new Error(
                    `usage 행이 수정되지 않았습니다. 수정이 실패했습니다. 이 문제는 유료 사용자가 서비스를 이용하지 못하는 상황이 발생할 수 있기 때문에 최우선적으로 해결해야 합니다.`,
                    {
                        cause: {
                            type: 'UPDATE_FAILED',
                            appUserId,
                            params: { [statusKey]: statusValue, subscriberData },
                            result: data,
                            error,
                        },
                    }
                );
            }

            usageLogger(this.requestId, successMessage);
        } catch (error: any) {
            usageLogger(
                this.requestId,
                `사용자 ${appUserId}의 구독 상태 업데이트 중 에러 발생: ${error.message}`
            );
            throw error;
        }
    }

    public async setToCancel(appUserId: string, isCancelled: boolean): Promise<void> {
        await this.pauseSub(
            appUserId,
            'is_subscription_canceled',
            isCancelled,
            `사용자 ${appUserId}의 구독 취소 상태 업데이트 성공.`,
            '취소 처리 웹훅이 발생했지만, 사용자는 구독중인 상태가 아니기 때문에 이와 관련된 처리는 무시했습니다.'
        );
    }

    public async setToPause(appUserId: string): Promise<void> {
        await this.pauseSub(
            appUserId,
            'is_subscription_paused',
            true,
            `사용자 ${appUserId}의 구독 일시 중지 업데이트 성공.`,
            '구독 일시 중지 웹훅이 발생했지만, 사용자는 구독중인 상태가 아니기 때문에 이와 관련된 처리는 무시했습니다.'
        );
    }

    public async setToExpired(appUserId: string): Promise<void> {
        const subscriberData = await fetchSubscriberData(appUserId);

        if (!subscriberData.is_active) {
            const msg =
                '구독 연장 웹훅이 발생했지만, 사용자는 구독중인 상태가 아니기 때문에 이와 관련된 처리는 무시했습니다.';
            usageLogger(this.requestId, msg);
            captureException(new Error(`${msg} 이 문제가 자주 발생한다면 조사하십시오.`));
            return;
        }

        const { data, error } = await this.supabase
            .from('usage')
            .update({
                premium_expires_date: subscriberData.subscriber.entitlements.premium.expires_date,
                data: JSON.stringify(subscriberData),
            })
            .eq('user_id', appUserId)
            .select()
            .single();

        if (error || !data) {
            throw new Error(
                `usage 행이 수정되지 않았습니다. 수정이 실패했습니다. 이 문제는 플랫폼에서 단행한 구독 연장을 처리하지 못한 문제입니다만, 이 문제로 인해서 사용자가 서비스를 이용못하게 되지는 않습니다. 하지만 자주 발생하면 조사하십시오.`,
                {
                    cause: {
                        type: 'UPDATE_FAILED',
                        appUserId,
                        result: data,
                        error,
                    },
                }
            );
        }
    }

    public async setToFreeToTransfer(from: string, to: string) {
        const subscriberData = await fetchSubscriberData(from);
        if (subscriberData.is_active) {
            const msg = `transfer는 form user(${from})는 무료, to user(${to})는 유료로 전환되는데 from user가 유료 사용자 상태입니다. 이것은 예상한 동작이 아니기 때문에 이 문제를 조사해보십시오`;
            usageLogger(this.requestId, msg);
            captureMessage(msg);
            throw new Error(msg);
            return;
        }
        const { data, error } = await this.supabase
            .from('usage')
            .update({
                status: 'ACTIVE',
                plan_type: 'FREE',
                store: null,
                data: JSON.stringify(subscriberData),
                premium_expires_date: null,
                premium_grace_period_expires_date: null,
                premium_product_identifier: null,
                premium_purchase_date: null,
                premium_product_plan_identifier: null,
                is_subscription_canceled: false,
                is_subscription_paused: false,
            })
            .eq('user_id', from)
            .select()
            .single();

        if (error || !data) {
            throw new Error(
                `usage 행이 수정되지 않았습니다. 수정이 실패했습니다. 이 문제는 transfer 웹훅을 다루는 과정에서 문제가 발생했습니다.  조치가 필요합니다.`,
                {
                    cause: {
                        type: 'UPDATE_FAILED',
                        appUserId: from,
                        result: data,
                        error,
                    },
                }
            );
        }
    }

    async setToFail(user_id: any, reason: string) {
        const subscriberData = await fetchSubscriberData(user_id);
        if (reason === 'BILLING_ERROR') {
            if (subscriberData.is_active) {
                throw new Error(
                    'updateToFail 실패. 사용자가 구독 상태인데, 빌링 오류가 발생했습니다. 따라서 이 오류는 무시 됩니다. 원인을 조사하십시오.'
                );
            }
            const { error } = await this.supabase
                .from('usage')
                .update({ status: 'INACTIVE_EXPIRED_AUTO_RENEW_FAIL' })
                .eq('user_id', user_id);
            if (error) {
                throw new Error(
                    'updateToFail 실패. 웹훅을 다루는 과정에서 문제가 발생했습니다.  조치가 필요합니다.'
                );
            }
        }
    }

    /**
     * 사용자의 API 사용량에 따른 비용을 업데이트하는 함수
     * @param userId - 사용자 ID
     * @param apiTypeId - API 타입 ID
     * @param usageAmount - 사용량
     * @param check - 검증 여부
     */
    async setQuota(
        userId: string,
        apiTypeId: number,
        usageAmount: number,
        check?: boolean
    ): Promise<void> {
        const _checked =
            check === undefined ? (process.env.NODE_ENV === 'development' ? true : false) : check;
        try {
            usageLogger(this.requestId, `사용자 ${userId}의 API 사용량 업데이트 시작`);

            let before: Database['public']['Tables']['usage']['Row'] | null = null;
            let after: Database['public']['Tables']['usage']['Row'] | null = null;

            if (_checked) {
                before = await this.get(userId);
                if (before === null) {
                    throw new Error(
                        this.requestId + ', 사용자의 사용량 정보를 가져오는데 실패했습니다.'
                    );
                }
                usageLogger(
                    this.requestId,
                    `사용자 ${userId}의 before current_quota : ${before.current_quota}`
                );
            }

            const params = {
                p_user_id: userId,
                p_api_type_id: apiTypeId,
                p_usage_amount: usageAmount,
                p_free_plan_limit: FREE_PLAN_USAGE_LIMIT,
                p_subscription_plan_limit: SUBSCRIPTION_USAGE_LIMIT,
            };
            const { error: rpcError } = await this.supabase.rpc('set_quota', params);

            if (rpcError) {
                throw new Error(`RPC 호출 실패: ${rpcError.message}`);
            }

            if (_checked) {
                after = await this.get(userId);

                // api_type에서 해당 ID의 행을 가져옵니다.
                const { data: apiTypeArray, error: apiTypeError } = await this.supabase
                    .from('api_type')
                    .select('*')
                    .eq('id', apiTypeId);

                if (apiTypeError || !apiTypeArray || apiTypeArray.length === 0) {
                    throw new Error(`api_type 정보를 가져오는데 실패했습니다.`);
                }
                usageLogger(
                    this.requestId,
                    `사용자 ${userId}의 after current_quota : ${after.current_quota}`
                );

                const apiType = apiTypeArray[0];
                const used = apiType.price * usageAmount + apiType.call_price;
                usageLogger({
                    warning: `이 측정 방식은 동시성 이슈에 취약합니다. 여러 프로세스가 동시에 실행된다면 아래와 같이 계산해야 합니다. 최초의 beforeQuota + sum(price * usageAmount + call_price) = 마지막 afterQuota`,
                    price: apiType.price,
                    usageAmount,
                    call_price: apiType.call_price,
                    'price * usageAmount + call_price': used,
                    // @ts-ignore
                    beforeQuota: before.current_quota,
                    afterQuota: after.current_quota,
                });
                //@ts-ignore
                if (!this.isCloseEnough(before.current_quota + used, after.current_quota)) {
                    throw new Error(
                        this.requestId +
                            // @ts-ignore
                            `, 사용량 계산 오류: 이전 사용량과 사용된 양의 합이 현재 사용량과 일치하지 않습니다. 기대값 : ${before.current_quota + used}, 실제값 : ${after!.current_quota}, 기대값 - 실제값 : ${before.current_quota + used - after.current_quota}`
                    );
                } else {
                    usageLogger(
                        this.requestId,
                        // @ts-ignore
                        `사용량 계산 성공: 이전 사용량과 사용된 양의 합이 현재 사용량과 일치합니다. ${before.current_quota + used} === ${after.current_quota}`
                    );
                }

                // 한도 및 상태 확인
                const limit =
                    before!.plan_type === 'FREE' ? FREE_PLAN_USAGE_LIMIT : SUBSCRIPTION_USAGE_LIMIT;
                const inactiveName =
                    before!.plan_type === 'FREE'
                        ? 'INACTIVE_FREE_USAGE_EXCEEDED'
                        : 'INACTIVE_SUBSCRIPTION_USAGE_EXCEEDED';

                //@ts-ignore
                if (after!.current_quota > limit && after!.status !== inactiveName) {
                    throw new Error(
                        `한도 초과 처리 오류: 상태가 올바르지 않습니다. ${after!.status} !== ${inactiveName}`
                    );
                } else {
                    usageLogger(
                        this.requestId,
                        `한도 초과 처리 성공: 상태가 올바르게 업데이트되었습니다. limit:${limit}, current:${after.current_quota}, status:${after!.status}`
                    );
                }
            }

            usageLogger(this.requestId, `사용자 ${userId}의 API 사용량 업데이트 종료 => 성공`);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Checks the quota for the user and throws an error if the quota is exceeded.
     * @param userId - The ID of the user.
     * @returns The usage data.
     * @throws An error if the usage data cannot be retrieved or if the quota is exceeded.
     */
    async checkQuota(userId: string) {
        addBreadcrumb({
            category: 'usage',
            message: 'usage 정보를 가져오는 중',
            level: 'fatal',
        });

        const { data: usageArray, error } = await this.supabase
            .from('usage')
            .select('*')
            .eq('user_id', userId);

        addBreadcrumb({
            category: 'usage',
            message: 'usage 정보를 가져옴',
            data: {
                usageArray,
                error,
            },
            level: 'fatal',
        });

        const usage = usageArray ? usageArray[0] : null;

        if (!usage || error) {
            addBreadcrumb({
                category: 'usage',
                message: 'usage 정보를 가져오지 못했습니다',
                data: {
                    usage,
                    error,
                },
            });
            authLogger('checkQuota', 'usage 정보를 가져오지 못했습니다.');
            throw new Error('사용량 정보를 가져오는데 실패했습니다.', {
                cause: 'NO_DATA',
            });
        }

        if (
            ['INACTIVE_FREE_USAGE_EXCEEDED', 'INACTIVE_SUBSCRIPTION_USAGE_EXCEEDED'].includes(
                usage.status
            )
        ) {
            const nextResetDate = dayjs(usage.next_reset_date);
            const formattedDate = nextResetDate.format('YYYY년 MM월 DD일');
            const daysRemaining = nextResetDate.diff(dayjs(), 'day');

            throw new Error(
                `월간 사용량이 초과되었습니다. 다음 초기화 일자: ${formattedDate} (${daysRemaining}일 남음)`,
                { cause: usage.status }
            );
        }

        if ('INACTIVE_EXPIRED_AUTO_RENEW_FAIL' === usage.status) {
            throw new Error(
                '구독 갱신에 실패했습니다. 일부 유료 기능 사용이 제한됩니다. 결제 정보를 확인해주세요.',
                {
                    cause: usage.status,
                }
            );
        }

        return usage;
    }

    /**
     * 주어진 userId의 currentUsage를 가져오는 메소드
     * @param userId - 사용자 ID
     * @returns 사용자의 currentUsage 데이터
     */
    async get(userId: string): Promise<Database['public']['Tables']['usage']['Row']> {
        usageLogger(this.requestId, `사용자 ${userId}의 currentUsage 정보를 가져오는 중`);
        const { data: usageArray, error } = await this.supabase
            .from('usage')
            .select('*')
            .eq('user_id', userId);
        if (error) {
            usageLogger(this.requestId, `사용자 ${userId}의 currentUsage 정보 가져오기 실패`, {
                error,
            });
            throw new Error('currentUsage 정보를 가져오는데 실패했습니다.', { cause: error });
        }
        const usage = usageArray ? usageArray[0] : null;
        if (!usage) {
            usageLogger(this.requestId, `사용자 ${userId}의 currentUsage 데이터 없음`);
            throw new Error('currentUsage 정보를 찾을 수 없습니다.', { cause: 'NO_DATA' });
        }
        usageLogger(this.requestId, `사용자 ${userId}의 currentUsage 정보 가져오기 성공`, {
            usage,
        });
        return usage;
    }

    public isCloseEnough(a: number, b: number) {
        return Math.abs(a - b) <= Number.EPSILON;
    }
}
