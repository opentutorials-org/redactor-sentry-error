'user client';
import { authLogger } from '@/debug/auth';
import { userType, NAMED } from '@/types';
import { getCookie } from './cookie';

export function getUserType(): userType | null {
    if (typeof window === 'undefined') return NAMED;
    const cookieType = getCookie('userType');
    if (cookieType) {
        setUserType(cookieType as userType); // 쿠키가 있으면 만료 날짜 갱신
        return cookieType as userType;
    } else {
        return null;
    }
}

export function setUserType(type: userType) {
    const expires = new Date('9999-01-01T00:00:00Z');
    document.cookie = `userType=${type}; expires=${expires.toUTCString()}; path=/`;
}
