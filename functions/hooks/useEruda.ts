// This hook initializes or destroys eruda based on the value of localStorage.OTU_debug.
import { captureException } from '@sentry/nextjs';
import { useEffect, useRef } from 'react';

const useEruda = () => {
    const isErudaInjected = useRef(false);

    useEffect(() => {
        const isDebugMode = localStorage.getItem('OTU_debug') === 'true';

        const injectEruda = () => {
            const script = document.createElement('script');
            script.id = 'eruda-script';
            script.src = 'https://cdn.jsdelivr.net/npm/eruda';
            // @ts-ignore
            script.onload = () => eruda.init();
            document.body.appendChild(script);
            isErudaInjected.current = true;
        };

        const removeEruda = () => {
            if (window.eruda && window.eruda.destroy) {
                window.eruda.destroy();
                const script = document.getElementById('eruda-script');
                if (script) {
                    document.body.removeChild(script);
                }
                isErudaInjected.current = false;
            }
        };
        try {
            if (isDebugMode) {
                if (!isErudaInjected.current) {
                    injectEruda();
                }
            } else {
                removeEruda();
            }
        } catch (e) {
            captureException(e);
        }
    });
};

export default useEruda;
