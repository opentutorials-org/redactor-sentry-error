'use client';
import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getUserType } from '../getUserType';
import { syncLogger } from '@/debug/sync';
import { NAMED } from '@/types';

export function useLastTabSurvive() {
    const router = useRouter();

    React.useEffect(() => {
        syncLogger('useLastTabSurvive useEffect 시작', { getUserType: getUserType() });
        if ([NAMED, null].includes(getUserType())) return () => {};
        const channel = new BroadcastChannel('last-tab');
        channel.postMessage({ type: 'active' });
        syncLogger('send', { type: 'active' });
        channel.onmessage = (e) => {
            syncLogger('receive', e.data);
            if (e.data.type === 'active') {
                channel.postMessage({ type: 'leave' });
            }
            if (e.data.type === 'leave') {
                router.push('/bye');
            }
        };
        return () => {
            syncLogger('send', { type: 'close' });
            channel.postMessage({ type: 'close' });
            channel.close();
        };
    }, []);
}
