'use client';
import { amplitudeLogger } from '@/debug/amplitude';
import { createClient } from '@/supabase/utils/client';
import { addBreadcrumb, captureException, setTag, setUser } from '@sentry/nextjs';
import { useEffect } from 'react';

export function useSentryAmplitudeInit() {
    setTag('webViewOs', 'NOT WEBVIEW');
    useEffect(() => {
        (async () => {
            const supabase = createClient();
            const {
                data: { session },
            } = await supabase.auth.getSession();
            if (session) {
                setUser({
                    id: session.user.id,
                    email: session.user.email,
                    ip_address: '{{auto}}',
                });
                setTag(
                    'amplitude user profile link',
                    `https://app.amplitude.com/analytics/opentutorials-696825/users?search=${session.user.id}&searchType=search`
                );
                setTimeout(() => {
                    try {
                        amplitudeLogger('amplitude 사용자 설정', session.user.id);
                        // @ts-ignore
                        if (window.amplitude) {
                            // @ts-ignore
                            window.amplitude.setUserId(session.user.id);
                        }
                    } catch (e) {
                        amplitudeLogger('amplitude 사용자 설정 실패', e);
                        captureException(e);
                    }
                }, 100);
            }
        })();
    }, []);
}
