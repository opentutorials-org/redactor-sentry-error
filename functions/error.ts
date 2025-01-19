import * as Sentry from '@sentry/nextjs';
export function reportErrorToSentry(msg: any) {
    const _msg = msg ? msg : 'No Message';
    Sentry.captureException(_msg);
}
