'use client';
import { useEffect } from 'react';

/* ios webkit에서 툴바를 viewport에 포함시키지 않는 문제를 해결하기 위한 클래스로 fit-height와 셋트 */
export function useCalculateViewportHeight() {
    useEffect(() => {
        const setViewportHeight = () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        };
        setViewportHeight();
        window.addEventListener('resize', setViewportHeight);
        return () => {
            window.removeEventListener('resize', setViewportHeight);
        };
    }, []);
}
