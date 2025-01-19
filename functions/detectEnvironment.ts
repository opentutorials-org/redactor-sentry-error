declare global {
    interface Window {
        process?: {
            type?: string;
            versions?: {
                electron?: string;
            };
        };
        Android?: any;
        webkit?: {
            messageHandlers?: any;
        };
    }
}

export function detectEnvironment() {
    // @ts-ignore
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const isWebView = /wv/.test(userAgent) || /WebView/.test(userAgent);
    // @ts-ignore
    const isAndroidWebView = typeof window.Android !== 'undefined';
    // @ts-ignore
    const isIOSWebView = window.webkit && window.webkit.messageHandlers;

    // @ts-ignore
    const isElectron =
        (typeof window !== 'undefined' &&
            typeof window.process === 'object' &&
            window.process.type === 'renderer') ||
        (typeof process !== 'undefined' &&
            typeof process.versions === 'object' &&
            !!process.versions.electron);

    if (isWebView || isAndroidWebView || isIOSWebView) {
        return 'WebView';
    } else if (isElectron) {
        return 'Electron';
    } else {
        return 'Browser';
    }
}

export function isAndroidWebViewOrBrowser(): boolean {
    const userAgent = navigator.userAgent || '';
    const isAndroid = /Android/i.test(userAgent);
    const isWebView = /\bwv\b/.test(userAgent) || /; wv\)/.test(userAgent); // 웹뷰 확인
    const isBrowser = isAndroid && !isWebView; // 웹뷰가 아니면 브라우저
    return isWebView || isBrowser;
}
