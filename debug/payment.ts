//@ts-ignore
import debug from 'debug';
export const paymentMethodLogger = debug('payment:method');
export const paymentInstantLogger = debug('payment:instant');
export const paymentTestLogger = debug('payment:test');
export const paymentFirstDialogLogger = debug('payment:first-dialog');
export const paymentCreateBillingKey = debug('payment:create-billing-key');
