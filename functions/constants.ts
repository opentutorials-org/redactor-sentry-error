// 로그인/마이그레이션 시에 user_id를 저장함. 세션을 체크할 때 이 값과 현재 사용자가 일치하는지를 확인하고 일치하지 않으면 로그아웃 처리를 함.
export const SESSION_USER_ID_FOR_CHECK_SYNC = 'SESSION_USER_ID_FOR_CHECK_SYNC';
export const API_PURPOSE = {
    IMAGE_TITLING: 3,
};

export const FREE_PLAN_USAGE_LIMIT = 1;
export const SUBSCRIPTION_USAGE_LIMIT = 10;
export const SUBSCRIPTION_PRICE_MONTHLY_USD = 5;
export const SUBSCRIPTION_PRICE_YEARLY_USD = 50;
export const SUBSCRIPTION_PRICE_MONTHLY_KRW = 6000;
export const SUBSCRIPTION_PRICE_YEARLY_KRW = 60000;

export const TEST_USER_ID = '11111111-1111-1111-1111-111111111111';
export const TEST_OTHER_USER_ID = '21111111-1111-1111-1111-111111111111';
export const TEST_CONSENT_VERSION = '2024-6-20';

export const PRODUCT_PAYMENT_TYPE_WEB_MONTHLY = 1;
export const PRODUCT_PAYMENT_TYPE_WEB_YEARLY = 2;
export const PRODUCT_PAYMENT_TYPE_IOS_MONTHLY = 3;
export const PRODUCT_PAYMENT_TYPE_IOS_YEARLY = 4;
export const PRODUCT_PAYMENT_TYPE_ANDROID_MONTHLY = 5;
export const PRODUCT_PAYMENT_TYPE_ANDROID_YEARLY = 6;

export const SUBSCRIPTION_ACTIVE_STATUS_ACTIVE = 'ACTIVE';
export const SUBSCRIPTION_ACTIVE_STATUS_ACTIVE_PENDING_PAYMENT_RETRY =
    'ACTIVE_PENDING_PAYMENT_RETRY';
export const SUBSCRIPTION_ACTIVE_STATUS_INACTIVE_EXPIRED_NO_AUTO_RENEWAL =
    'INACTIVE_EXPIRED_NO_AUTO_RENEWAL';
export const SUBSCRIPTION_ACTIVE_STATUS_INACTIVE_REFUNDED = 'INACTIVE_REFUNDED';
export const SUBSCRIPTION_ACTIVE_STATUS_INACTIVE_EXPIRED_CANCELLED = 'INACTIVE_EXPIRED_CANCELLED';
export const SUBSCRIPTION_ACTIVE_STATUS_INACTIVE_EXPIRED_AUTO_RENEWAL_FAILED =
    'INACTIVE_EXPIRED_AUTO_RENEWAL_FAILED';
export const SUBSCRIPTION_ACTIVE_STATUS_INACTIVE_TERMINATED_DUE_TO_VIOLATION =
    'INACTIVE_TERMINATED_DUE_TO_VIOLATION';
export const SUBSCRIPTION_ACTIVE_STATUS_INACTIVE_PENDING_BILLING_KEY =
    'INACTIVE_PENDING_BILLING_KEY';
export const SUBSCRIPTION_ACTIVE_STATUS_INACTIVE_PENDING_FIRST_PAY = 'INACTIVE_PENDING_FIRST_PAY';

export const PG_TOSS = 'TOSS';

export type Locale = (typeof locales)[number];
export const locales = ['en', 'ko'] as const;
export const defaultLocale: Locale = 'ko';
export const LANG_COOKIE_NAME = 'OTU_LOCALE';

export const DELIMITER_TITLE_BODY = '..';

export const DEFAULT_RESET_QUANTITY = 20;
export const domPurifyOption = {
    ALLOWED_TAGS: [
        'h1',
        'h2',
        'h3',
        'figure',
        'img',
        'ul',
        'li',
        'div',
        'iframe',
        'table',
        'tbody',
        'tr',
        'td',
        'p',
        'pre',
        'hr',
        'blockquote',
        'ol',
        'i',
        'sup',
        'sub',
        'mark',
        'a',
        'b',
        'br',
        'code',
        'span',
        'cite',
    ],
    ALLOWED_ATTR: [
        'src',
        'id',
        'data-image',
        'href',
        'width',
        'height',
        'frameborder',
        'allowfullscreen',
        'class',
        'data-placeholder',
        'target',
        'style',
    ],
};
export const RAG_SEARCH_MIN_LENGTH_THRESHOLD = 600;
export const IMAGE_SHRINK_POLICY_WIDTH = '564';
export const IMAGE_SHRINK_POLICY_HEIGHT = '1200';
export const IMAGE_SHRINK_POLICY_COMPRESSION = '85%';
export const IMAGE_SHRINK_POLICY_STRING = `${IMAGE_SHRINK_POLICY_WIDTH}x${IMAGE_SHRINK_POLICY_HEIGHT} ${IMAGE_SHRINK_POLICY_COMPRESSION}`;

export const TEXT_MODEL_NAME = 'gpt-4o-2024-08-06';
export const TEXT_INPUT_MODEL_TYPE_ID = 17;
export const TEXT_OUTPUT_MODEL_TYPE_ID = 18;
export const UPLOADCARE_TYPE_ID = 23;
export const TEXT_VISION_LOW_TYPE_ID = 19;
export const TEXT_VISION_HIGH_TYPE_ID = 24;
