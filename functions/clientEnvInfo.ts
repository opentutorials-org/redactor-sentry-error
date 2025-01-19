export function isInWebView(): boolean {
    return (
        window?.webkit?.messageHandlers.requestSubscriptionPayment !== undefined ||
        window?.webview?.requestSubscriptionPayment !== undefined
    );
}

export function getEnvOs(): string {
    if (window?.webkit?.messageHandlers.requestSubscriptionPayment !== undefined) {
        return 'ios';
    } else if (window?.webview?.requestSubscriptionPayment !== undefined) {
        return 'android';
    } else if (typeof window !== 'undefined' && typeof window.document !== 'undefined') {
        return 'browser';
    } else {
        return 'etc';
    }
}
