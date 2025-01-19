import { getUserLocale } from '@/i18n';
import { createClient } from '@/supabase/utils/client';
import { Purchases } from '@revenuecat/purchases-js';
import { Locale } from '../constants';
import { User } from '@supabase/supabase-js';

/**
 * RevenueCat SDK 초기화
 */
export const initializeRevenueCat = async (appUserId: string) => {
    await Purchases.configure(
        process.env.NEXT_PUBLIC_REVENUECAT_API_PUBLIC_KEY!,
        appUserId // 유저 ID 설정
    );
};

/**
 * 특정 패키지 구매 요청
 * @param tierId 요금제 ID
 */
export const purchasePackage = async (tierId: string, locale: Locale, userData: User) => {
    const offerings = await Purchases.getSharedInstance().getOfferings();

    const pkg = offerings.current?.availablePackages.find(
        (p: { identifier: string }) => p.identifier === tierId
    );

    if (!pkg) {
        throw new Error('해당 tierId에 대한 패키지를 찾을 수 없습니다.');
    }

    try {
        const { customerInfo, redemptionInfo } = await Purchases.getSharedInstance().purchase({
            rcPackage: pkg,
            purchaseOption: null,
            selectedLocale: locale,
            customerEmail: userData.email,
        });
        // 구매완료 후에 결과에 따른 check 처리 필요함.

        // 구매 완료 후 후속 처리
        const response = await fetch('/api/usage/checkFreePayToSub', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'accept-language': locale,
            },
        });

        if (!response.ok) {
            throw new Error('후속 처리 중 오류 발생');
        }

        const result = await response.json();
        console.log('후속 처리 결과:', result);
        // 리디렉션 URL이 있는 경우 해당 URL로 리디렉션
        if (result.data.redirectUrl) {
            window.location.href = result.data.redirectUrl;
        } else {
            // 리디렉션 URL이 없는 경우 기본 URL로 리디렉션
            const defaultUrl = '/home'; // 기본 URL 설정
            window.location.href = defaultUrl;
        }
    } catch (error) {
        console.error('구매 중 오류 발생:', error);
    }
};
/**
 * RevenueCat 결제 URL 생성 함수
 * @returns 결제 URL
 */
export const handleOpenPayment = async (tierId: string): Promise<void> => {
    const supabase = createClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || userData.user === null) {
        throw new Error('사용자 정보를 가져올 수 없습니다.');
    }
    const userId = userData.user.id;
    await initializeRevenueCat(userId); // RevenueCat 초기화

    const locale = await getUserLocale();

    try {
        await purchasePackage(tierId, locale, userData.user); // 구매 요청
    } catch (error) {
        console.error('결제 처리 실패:', error);
    }
};

/**
 * 웹 결제 처리 함수
 * @param tierId 요금제 ID
 */
export const handleWebPayment = async (tierId: string): Promise<void> => {
    try {
        await handleOpenPayment(tierId);
    } catch (error) {
        console.error('웹 결제 실패:', error);
        alert('결제 처리 중 문제가 발생했습니다. 다시 시도해주세요.');
    }
};

/**
 * URL을 정상화하는 함수
 * @param url 입력 URL
 * @returns 슬래시로 끝나는 URL
 */
export const normalizeUrl = (url: string): string => {
    return url.endsWith('/') ? url : `${url}/`;
};
