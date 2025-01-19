import { swLogger } from '@/debug/sw';
import { openConfirmState, snackbarState } from '@/jotai';
import { is } from 'cheerio/dist/commonjs/api/traversing';
import { useSetAtom } from 'jotai';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { openSnackbarState } from '@/jotai';
export default function useServiceWorkerReload() {
    const openSnackbar = useSetAtom(openSnackbarState);
    const [isCancelReloadRequest, setIsCancelReloadRequest] = useState(false);
    const t = useTranslations();

    // Fetch the version from the server and compare with local commit_id
    const checkVersionAndUpdateCache = async () => {
        swLogger('Service Worker 버전 체크를 시작합니다.');
        try {
            if (process.env.NEXT_PUBLIC_PWA_DISABLED === 'true') {
                swLogger('PWA가 비활성화되어 있습니다. 서버 버전 체크를 중지합니다.');
                return;
            }
            const response = await fetch('/api/check/version');
            const serverVersion = await response.text();
            const localVersion = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || 'unknown';
            if (!navigator.onLine) {
                swLogger('오프라인 상태입니다. 서버 버전 체크를 중지합니다.');
                return;
            }

            if (serverVersion !== localVersion) {
                swLogger('서버 버전이 다릅니다. 캐쉬를 삭제합니다.', {
                    serverVersion,
                    localVersion,
                });
                if ('caches' in window) {
                    const cacheNames = await caches.keys();
                    await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
                    if (!isCancelReloadRequest) {
                        swLogger('Service Worker에 리로드 요청을 보냅니다.');
                        openSnackbar({
                            message: t('notice.update-so-reload') + '.', // .을 붙인 이유는 서비스 워커에 의한 업데이트인지 여부를 구분하기 위함
                            severity: 'info',
                            autoHideDuration: 30000,
                            horizontal: 'left',
                            vertical: 'bottom',
                            actionBtn: {
                                label: t('notice.refresh'),
                                onClick: () => {
                                    window.location.reload();
                                },
                            },
                        });
                    }
                    swLogger('캐시 삭제 완료');
                }
            } else {
                swLogger('서버 버전이 같습니다');
            }
        } catch (error) {
            swLogger('버전 체크 중 오류가 발생했습니다:', error);
        }
    };

    // Schedule the version check
    const scheduleVersionCheck = () => {
        setTimeout(() => {
            checkVersionAndUpdateCache();
        }, 30000); // 1 minutes after reload

        setInterval(() => {
            checkVersionAndUpdateCache();
        }, 3600000); // Every 1 hour
    };

    useEffect(() => {
        scheduleVersionCheck();
    }, []);

    useEffect(() => {
        if (navigator.serviceWorker && !isCancelReloadRequest) {
            swLogger('Service Worker에 message 이벤트 리스너를 등록합니다.');
            navigator.serviceWorker.addEventListener('message', (event) => {
                swLogger('Service Worker로부터 메시지를 받았습니다:', event.data);
                if (event.data.type === 'RELOAD_REQUEST') {
                    swLogger('Service Worker로부터 리로드 요청을 받았습니다.');
                    setIsCancelReloadRequest(true);
                    openSnackbar({
                        message: t('notice.update-so-reload'),
                        severity: 'info',
                        autoHideDuration: 30000,
                        horizontal: 'left',
                        vertical: 'bottom',
                        actionBtn: {
                            label: t('notice.refresh'),
                            onClick: () => {
                                window.location.reload();
                            },
                        },
                    });
                }
            });
        }
    }, []);
}
