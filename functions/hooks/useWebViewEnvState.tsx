'use client';
import { communicateWithAppsWithCallback } from '@/components/core/WebViewCommunicator';
import { usageLogger } from '@/debug/usage';
import { webviewLogger } from '@/debug/webview';
import { openConfirmState, webViewEnvState } from '@/jotai';
import { createClient, fetchUserId } from '@/supabase/utils/client';
import { useAtom, useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { openSnackbarState } from '@/jotai';
import { captureMessage, setTag } from '@sentry/nextjs';
import { useTranslations } from 'next-intl';

/**
 * 결제 웹뷰 환경을 설정하는 커스텀 훅입니다.
 */
export function useConfigPaymentWebView() {
    const t = useTranslations();
    const setWebView = useSetAtom(webViewEnvState);
    const openConfirm = useSetAtom(openConfirmState);
    const openSnackbar = useSetAtom(openSnackbarState);

    useEffect(() => {
        /**
         * OS 정보를 웹뷰에 전달하여 웹뷰 환경을 설정합니다.
         * @param {string} osName - 운영체제 이름
         * @param {string} osVersion - 운영체제 버전
         * @param {string} monthlySubscriptionPrice - 월간 구독 가격
         * @param {string} yearlySubscriptionPrice - 연간 구독 가격
         *
         * @example
         * // 콘솔 창에서 아래와 같이 호출하면 테스트 할 수 있습니다.
         * responseOSInfoToWeb('android', '10', '$6900', '$69000');
         */
        const responseOSInfoToWeb = (
            osName: string,
            osVersion: string,
            monthlySubscriptionPrice: string,
            yearlySubscriptionPrice: string
        ) => {
            console.log(
                'responseOSInfoToWeb',
                osName,
                osVersion,
                monthlySubscriptionPrice,
                yearlySubscriptionPrice
            );
            webviewLogger('responseOSInfoToWeb를 호출해서 webview의 컨테이너를 설정합니다. ', {
                osName,
                osVersion,
                monthlySubscriptionPrice,
                yearlySubscriptionPrice,
            });
            setTag('webViewOs', osName);
            setWebView({ osName, osVersion, monthlySubscriptionPrice, yearlySubscriptionPrice });
        };

        /**
         * 구독 결과를 웹뷰에 전달합니다.
         * @param {string} result - 구독 결과
         *
         * @example
         * // 콘솔 창에서 아래와 같이 호출하면 테스트 할 수 있습니다.
         * responseSubscriptionToWeb('success');
         * responseSubscriptionToWeb('failed');
         */
        const responseSubscriptionToWeb = (result: string) => {
            webviewLogger('responseSubscriptionToWeb를 호출해서 구독 결과를 피드백 합니다.  ', {
                result,
            });

            /**
             * 구독 플랜 타입을 확인합니다.
             * @returns {Promise<boolean>} - 플랜 타입이 유효한지 여부를 반환합니다.
             */
            const checkPlanType = async () => {
                const supabase = createClient();
                await fetch(`/api/usage/checkFreePayToSub`);
                const user_id = await fetchUserId();
                const { data, error } = await supabase
                    .from('usage')
                    .select('*')
                    .eq('user_id', user_id)
                    .single();
                usageLogger('구독 정보 조회', { data, error });
                if (error) return false;
                if (!data) return false;
                return ['MONTHLY', 'YEARLY'].includes(data.plan_type);
            };

            /**
             * 구독 플랜 타입을 재시도하여 확인합니다.
             * @param {number} retries - 남은 재시도 횟수
             */
            const retryCheckPlanType = async (retries = 0) => {
                if (await checkPlanType()) {
                    openSnackbar({
                        message: t('subscription.success-message'),
                        severity: 'success',
                        autoHideDuration: 5000,
                        horizontal: 'left',
                        vertical: 'bottom',
                    });
                } else if (retries > 0) {
                    setTimeout(() => retryCheckPlanType(retries - 1), 3000);
                } else {
                    const supabase = createClient();
                    const user = await supabase.auth.getUser();
                    const msg = `구독 정보 조회 실패. 플랫폼에서는 구독에 성공했음을 알려왔는데 OTU의 usage 테이블은 play_type을 MONTHLY, YEARLY로 변경하지 못하고 있습니다. 구독 회원에게 불편을 초래할 가능성이 높기 때문에 즉시 확인해야 합니다. ${JSON.stringify(user.data.user)}`;
                    usageLogger(msg);
                    captureMessage(msg, 'fatal');
                    openConfirm({
                        message: t('subscription.error.load-failed'),
                        yesLabel: t('subscription.retry-check'),
                        onYes: () => {
                            retryCheckPlanType();
                        },
                        onNo: () => {},
                        noLabel: t('subscription.close'),
                    });
                }
            };
            openSnackbar({
                message: t('subscription.checking-status'),
                severity: 'success',
                autoHideDuration: 5000,
                horizontal: 'left',
                vertical: 'bottom',
            });
            if (result === 'success') {
                retryCheckPlanType(3);
            } else if (result === 'failed') {
                captureMessage(
                    '구독 정보 결과 실패. 플래폼에서 구독 실패를 알려 옴. 이것은 OTU의 문제가 아니라 플랫폼의 문제이거나, 사용자의 문제일 가능성이 높습니다. 이 사례가 급격'
                );
                openSnackbar({
                    message: t('subscription.failed-message'),
                    severity: 'error',
                    autoHideDuration: 5000,
                    horizontal: 'left',
                    vertical: 'bottom',
                });
            }
        };

        if (window) {
            // @ts-ignore
            window.responseOSInfoToWeb = responseOSInfoToWeb;
            // @ts-ignore
            window.responseSubscriptionToWeb = responseSubscriptionToWeb;
        }

        const supabase = createClient();
        supabase.auth.getUser().then((user) => {
            if (user && user.data && user.data.user) {
                const userId = user.data.user.id;
                webviewLogger(
                    `사용자가 로그인했습니다. 네이티브에게 OS 정보를 요청하기 위해서 requestOSInfoToNative(${userId})를 호출합니다.`
                );
                communicateWithAppsWithCallback('requestOSInfoToNative', userId);
            } else {
                webviewLogger(
                    `사용자가 로그인했지만 userId가 없어서 requestOSInfoToNative를 호출하지 못했습니다. .`
                );
            }
        });
    }, [setWebView, openConfirm, openSnackbar]);
}
