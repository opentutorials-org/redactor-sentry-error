import { Database } from '@/database.types';
import { authLogger } from '@/debug/auth';
import { fetchUserId } from '@/supabase/utils/server';
import { addBreadcrumb, captureMessage } from '@sentry/nextjs';
import { SupabaseClient } from '@supabase/supabase-js';
import dayjs from 'dayjs';

export async function getUsage(
    supabase: SupabaseClient
): Promise<Database['public']['Tables']['usage']['Row']> {
    addBreadcrumb({
        category: 'usage',
        message: 'usage 정보를 가져오는 중',
        level: 'fatal',
    });

    const user_id = await fetchUserId();
    const { data: usageArray, error } = await supabase
        .from('usage')
        .select('*')
        .eq('user_id', user_id);

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
        authLogger('getUsage', 'usage 정보를 가져오지 못했습니다.');
        throw new Error('사용량 정보를 가져오는데 실패했습니다. ', {
            cause: 'NO_DATA',
        });
    }

    if (
        ['INACTIVE_FREE_USAGE_EXCEEDED', 'INACTIVE_SUBSCRIPTION_USAGE_EXCEEDED'].includes(
            usage.status
        )
    ) {
        const now = dayjs();
        const nextResetDate = dayjs(usage.next_reset_date);
        const daysRemaining = nextResetDate.diff(now, 'day');
        throw new Error(
            `월간 사용량이 초과되었습니다. 다음 초기화 일자 : ${nextResetDate.format('YYYY년 MM월 DD일')} (${daysRemaining}일 남음)`,
            {
                cause: usage.status,
            }
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
