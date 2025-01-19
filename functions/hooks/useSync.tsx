import { useTranslations } from 'next-intl';
import {
    refreshSeedAfterContentUpdate,
    runSyncIdState,
    runSyncState,
    syncingState,
    contentListMessageState,
    syncResultState,
} from '@/jotai';
import {
    count,
    pullOnlyOnline,
    pushOnlyOffline,
    verifyByCount,
    verifyByLast,
    verifyStrong,
} from '@/watermelondb/control/Page';
import { NAMED } from '@/types';
import { sync } from '@/watermelondb/sync';
import { useAtomValue, useSetAtom } from 'jotai';
import { throttle } from 'lodash';
import { useCallback, useEffect, useRef } from 'react';
import * as Sentry from '@sentry/nextjs';
import { syncLogger } from '@/debug/sync';
import { getUserType } from '../getUserType';
import { createClient } from '@/supabase/utils/client';
import { clearOnlyWatermelonDB, clearStorage } from '../clearStorage';
import { SESSION_USER_ID_FOR_CHECK_SYNC } from '../constants';
import { getCookie } from '../cookie';
import { redirect } from 'next/navigation';

export const useSync = () => {
    const t = useTranslations();
    const setLastUpdateContentId = useSetAtom(refreshSeedAfterContentUpdate);
    const setSyncing = useSetAtom(syncingState);
    const runSync = useSetAtom(runSyncState);
    const runSyncId = useAtomValue(runSyncIdState);
    const syncResult = useSetAtom(syncResultState);
    const isFirstSync = useRef(false);
    const setContentListMessage = useSetAtom(contentListMessageState);

    const checkSessionExpiration = async () => {
        syncLogger('checkSessionExpiration start');
        const supabase = createClient();
        const { data, error: sessionError } = await supabase.auth.getSession();
        Sentry.addBreadcrumb({
            category: 'sync',
            message: 'checkSessionExpiration',
            data: {
                sessionData: data,
                sessionError,
            },
        });
        let user_id = null;
        if (data.session === null) {
            const parseCookies = (cookieString: string) => {
                return cookieString
                    .split(';')
                    .map((cookie) => cookie.trim())
                    .reduce((acc, cookie) => {
                        const [name, value] = cookie.split('=');
                        // @ts-ignore
                        acc[name] = decodeURIComponent(value);
                        return acc;
                    }, {});
            };
            const cookies = parseCookies(document.cookie);
            const { data: userData, error: userError } = await supabase.auth.getUser();
            if (userData.user === null) {
                console.log('예상치 못한 로그아웃 문제 원인 파악을 위한 로그', {
                    sessionError,
                    userData,
                    userError,
                    cookies,
                });
                await supabase.auth.signOut();
                await clearStorage(
                    'checkSessionExpiration에서 getUser의 값이 null이기 때문에 로그아웃'
                );
                throw new Error('세션이 만료 되었습니다');
            }
            user_id = userData.user.id;
        } else {
            user_id = data.session.user.id;
        }
        const sessionCheckFlag = getCookie(SESSION_USER_ID_FOR_CHECK_SYNC);
        if (sessionCheckFlag !== user_id) {
            syncLogger(
                'SESSION_USER_ID_FOR_CHECK_SYNC 불일치가 분 이 값이 불일치하면 다른 사용자의 데이터가 남아있을 수 있기 때문에 안전을 위해서 로그아웃합니다.',
                {
                    SESSION_USER_ID_FOR_CHECK_SYNC,
                    'data.session.user.id': user_id,
                }
            );
            await supabase.auth.signOut();
            await clearStorage(
                `로그인 된 사용자(${user_id})와 SESSION_USER_ID_FOR_CHECK_SYNC(${SESSION_USER_ID_FOR_CHECK_SYNC}) 값이 다름`
            );
            redirect('/welcome');
        }
    };

    useEffect(() => {
        if (runSyncId) {
            (async () => {
                try {
                    syncLogger('runSync start');
                    if (getUserType() === NAMED) {
                        // await checkSessionExpiration();
                        await performSync();
                    } else {
                        syncLogger('runSync end (not named user)');
                    }
                } catch (error) {
                    console.error(error);
                }
            })();
        }
    }, [runSyncId]);

    useEffect(() => {
        const goOnline = () => {
            runSync({});
        };
        window.addEventListener('online', goOnline);
        return () => {
            window.removeEventListener('online', goOnline);
        };
    }, []);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                runSync({});
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    useEffect(() => {
        const inTab = () => {
            runSync({});
        };
        window.addEventListener('focus', inTab);
        return () => {
            window.removeEventListener('focus', inTab);
        };
    }, []);

    useEffect(() => {
        setInterval(
            () => {
                runSync({});
            },
            1000 * 60 * 30
        );
    }, []);

    useEffect(() => {
        setTimeout(() => {
            runSync({});
        }, 1);
    }, []);

    type failOverResultType = {
        offlineTotal: number;
        onlineTotal: number;
        onlyOfflineIds: string[];
        onlyOnlineIds: string[];
    };
    // 테스트 할 때 only local과 only remote를 동수로 하면 verify에서 걸러지지 못하기 때문에 주의가 필요함.
    const failOver = async ({
        offlineTotal,
        onlineTotal,
        onlyOfflineIds,
        onlyOnlineIds,
    }: failOverResultType) => {
        if (onlyOfflineIds.length > 0) {
            await pushOnlyOffline(onlyOfflineIds);
        }
        if (onlyOnlineIds.length > 0) {
            await pullOnlyOnline(onlyOnlineIds);
        }
    };
    type checkSyncResultType = {
        isSuccess: boolean;
        data?: any;
    };

    const checkSync = async (): Promise<checkSyncResultType> => {
        try {
            // 두 검증을 병렬로 실행 (옵션)
            const [verifyLastResult, verifyCountResult] = await Promise.all([
                verifyByLast(),
                verifyByCount(),
            ]);

            syncLogger('light sync verify by last', verifyLastResult);
            syncLogger('light sync verify by count', verifyCountResult);

            if (!verifyLastResult.isEqual || !verifyCountResult.isEqual) {
                const verifyStrongResult = await verifyStrong();
                syncLogger('strong sync verify after last or count check', verifyStrongResult);
                return { isSuccess: false, data: verifyStrongResult };
            }

            return { isSuccess: true };
        } catch (error) {
            syncLogger('Error during synchronization check', error);
            Sentry.captureException(error);
            // 필요한 경우, 강력한 검증을 수행하거나, 실패를 반환할 수 있습니다.
            // @ts-ignore
            return { isSuccess: false, data: { error: error.message } };
        }
    };

    const performSync = useCallback(
        throttle(async (isReset?: boolean) => {
            if (getUserType() !== NAMED) return;
            Sentry.addBreadcrumb({
                category: 'sync',
                message: 'sync start (performSync)',
                level: 'info',
            });

            let result = null;
            setSyncing(true);

            try {
                result = await sync(isReset, ({ name, progress }) => {
                    if (name === 'pull_progress')
                        setContentListMessage(
                            t.markup('migration.sync', {
                                br: () => '<br />',
                                progress,
                            })
                        );
                    if (name === 'end') setContentListMessage('');
                });
                if (result.pullCount > 0) {
                    syncLogger(
                        `${result.pullCount}개의 데이터를 가져왔기 때문에 setLastUpdateContentId를 호출해서 레이아웃을 랜더링 함.`
                    );
                    setLastUpdateContentId(Math.random());
                }
                syncResult(result);

                if (isFirstSync.current === false) {
                    const pageCount = await count(true);
                    if (pageCount === 0) {
                        setContentListMessage(t('editor.please-write-simple-notes-here'));
                    } else {
                        const checkSyncResult1 = await checkSync();
                        if (checkSyncResult1.isSuccess === false) {
                            Sentry.addBreadcrumb({
                                category: 'sync',
                                message: 'sync checkSync fail (first try)',
                                level: 'error',
                                data: checkSyncResult1,
                            });
                            await failOver(checkSyncResult1.data!);
                            const checkSyncResult2 = await checkSync();
                            if (checkSyncResult2.isSuccess === true) {
                                syncLogger('file over success');
                                Sentry.captureMessage('sync checkSync fail (second try)', {
                                    extra: checkSyncResult2,
                                });
                            } else {
                                syncLogger('file over fail', checkSyncResult2);
                            }
                        }
                    }
                    isFirstSync.current = true;
                }
            } catch (e) {
                console.error(e);
            }

            setSyncing(false);
            return result;
        }, 3000),
        []
    );
};
