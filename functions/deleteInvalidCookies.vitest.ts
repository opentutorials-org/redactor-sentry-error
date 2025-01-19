import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NAMED } from '@/types';
import {
    deleteInvalidCookies,
    deleteNextCookie,
    getStorageKey,
} from '@/functions/deleteInvalidCookies';
const storageKey = 'sb-localhost-auth-token';
describe('쓰래기 쿠키 삭제 테스트', () => {
    it('관련 없는 정보만 있을 때', () => {
        const cookies = [{ name: storageKey, value: '{"id":"1"}' }];
        const mockCallback = vi.fn();
        deleteInvalidCookies(cookies, storageKey, mockCallback);
        expect(mockCallback).toHaveBeenCalledTimes(0);
    });
    it('유효한 정보만 있을 때', () => {
        const cookies = [
            { name: storageKey + '.0', value: '{"id":"1' },
            { name: storageKey + '.1', value: '"}' },
        ];
        const mockCallback = vi.fn();
        deleteInvalidCookies(cookies, storageKey, mockCallback);
        expect(mockCallback).toHaveBeenCalledTimes(0);
    });
    it('순서가 섞였을 때', () => {
        const cookies = [
            { name: storageKey + '.1', value: '"}' },
            { name: storageKey + '.0', value: '{"id":"1' },
        ];
        const mockCallback = vi.fn();
        deleteInvalidCookies(cookies, storageKey, mockCallback);
        expect(mockCallback).toHaveBeenCalledTimes(0);
    });
    it('다른 쿠키가 섞였을 때 ', () => {
        const cookies = [
            { name: storageKey + '.1', value: '"}' },
            { name: storageKey + '.0', value: '{"id":"1' },
            { name: 'userType', value: NAMED },
        ];
        const mockCallback = vi.fn();
        deleteInvalidCookies(cookies, storageKey, mockCallback);
        expect(mockCallback).toHaveBeenCalledTimes(0);
    });
    it('숫자가 없는 데이터와 숫자가 있는 데이터 그리고 불순 데이터가 섞였을 때', () => {
        const cookies = [
            { name: storageKey, value: '{"id":"1"}' },
            { name: storageKey + '.1', value: '"}' },
            { name: storageKey + '.0', value: '{"id":"1' },
            { name: storageKey + '.2', value: 'id":"1"}' },
            { name: storageKey + '.3', value: 'id":"2"}' },
            { name: 'userType', value: NAMED },
        ];
        const mockCallback = vi.fn();
        deleteInvalidCookies(cookies, storageKey, mockCallback);
        expect(mockCallback.mock.calls[0][0]).toBe(storageKey + '.2');
        expect(mockCallback.mock.calls[1][0]).toBe(storageKey + '.3');
    });
    it('불순 데이터가 섞였을 때', () => {
        const cookies = [
            { name: storageKey + '.1', value: '"}' },
            { name: storageKey + '.0', value: '{"id":"1' },
            { name: storageKey + '.2', value: 'id":"1"}' },
            { name: storageKey + '.3', value: 'id":"2"}' },
            { name: 'userType', value: NAMED },
        ];
        const mockCallback = vi.fn();
        deleteInvalidCookies(cookies, storageKey, mockCallback);
        expect(mockCallback.mock.calls[0][0]).toBe(storageKey + '.2');
        expect(mockCallback.mock.calls[1][0]).toBe(storageKey + '.3');
    });
});

describe('다음 쿠키 값 추출 테스트', () => {
    it('쿠키가 있지만, 순서가 섞여 있을 떄', () => {
        const cookies = [
            { name: storageKey + '.1', value: '"}' },
            { name: storageKey + '.0', value: '{"id":"1' },
        ];
        const onInvalidCookieFoundMock = vi.fn();
        deleteNextCookie(cookies, storageKey, onInvalidCookieFoundMock);
        expect(onInvalidCookieFoundMock.mock.calls[0][0]).toBe(storageKey + '.2');
    });
});

describe('스토리지 키 테스트', () => {
    it('NEXT_PUBLIC_SUPABASE_URL=https://bfrztqescfrytlkwigbh.supabase.co', () => {
        expect(getStorageKey('https://bfrztqescfrytlkwigbh.supabase.co')).toBe(
            'sb-bfrztqescfrytlkwigbh-auth-token'
        );
    });
    it('NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321', () => {
        expect(getStorageKey('http://localhost:54321')).toBe('sb-localhost-auth-token');
    });
    it('NEXT_PUBLIC_SUPABASE_URL=http://172.30.1.83:54321', () => {
        expect(getStorageKey('http://172.30.1.83:54321')).toBe('sb-172-auth-token');
    });
    it('NEXT_PUBLIC_SUPABASE_URL=https://80eb-210-178-49-199.ngrok-free.app ', () => {
        expect(getStorageKey('https://80eb-210-178-49-199.ngrok-free.app')).toBe(
            'sb-80eb-210-178-49-199-auth-token'
        );
    });
});
