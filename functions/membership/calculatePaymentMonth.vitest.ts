import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { calculatePaymentMonth } from './calculatePaymentMonth'; // 적절한 경로로 모듈을 임포트

describe('calculatePaymentMonth', () => {
    beforeEach(() => {
        // tell vitest we use mocked time
        vi.useFakeTimers();
    });

    afterEach(() => {
        // restoring date after each test run
        vi.useRealTimers();
    });

    it('latestStatBeginDate < now() : exception', () => {
        const latestStatBeginDate = '230702';
        const today = new Date(Date.UTC(2023, 6, 1, 23, 59, 59)); // 23.7.1 00:00:00
        vi.setSystemTime(today);
        expect(() => calculatePaymentMonth(latestStatBeginDate)).toThrow(
            'latestStatBeginDate은 now() 보다 앞서야 합니다'
        );
    });

    it('latestStatBeginDate + 1개월 > now() : latestStatBeginDate', () => {
        const latestStatBeginDate = '230701';
        const today = new Date(Date.UTC(2023, 6, 29)); // 23.7.29 00:00:00
        const expectedOutput = latestStatBeginDate;
        vi.setSystemTime(today);
        expect(calculatePaymentMonth(latestStatBeginDate)).toBe(expectedOutput);
    });

    it('latestStatBeginDate + 1개월 = now() : latestStatBeginDate', () => {
        const latestStatBeginDate = '230701';
        const today = new Date(Date.UTC(2023, 7, 1)); // 23.8.2 00:00:00
        const expectedOutput = '230701';
        vi.setSystemTime(today);
        expect(calculatePaymentMonth(latestStatBeginDate)).toBe(expectedOutput);
    });

    it('latestStatBeginDate + 1개월 < now() : now().year,month + latestStatBeginDate.day', () => {
        const latestStatBeginDate = '230701';
        const today = new Date(Date.UTC(2023, 7, 1, 0, 0, 1)); // 23.8.2 00:00:00
        const expectedOutput = '230801';
        vi.setSystemTime(today);
        expect(calculatePaymentMonth(latestStatBeginDate)).toBe(expectedOutput);
    });

    it('latestStatBeginDate + 2개월 = now() : now().year,month + latestStatBeginDate.day', () => {
        const latestStatBeginDate = '230701';
        const today = new Date(Date.UTC(2023, 8, 1, 0, 0, 1)); // 23.8.2 00:00:00
        const expectedOutput = '230901';
        vi.setSystemTime(today);
        expect(calculatePaymentMonth(latestStatBeginDate)).toBe(expectedOutput);
    });

    it('latestStatBeginDate + 6개월 (년이 바뀜) = now() : now().year,month + latestStatBeginDate.day', () => {
        const latestStatBeginDate = '230701';
        const today = new Date(Date.UTC(2024, 0, 1, 0, 0, 1)); // 23.8.2 00:00:00
        const expectedOutput = '240101';
        vi.setSystemTime(today);
        expect(calculatePaymentMonth(latestStatBeginDate)).toBe(expectedOutput);
    });

    it('latestStatBeginDate + 1개월 (월이 없음) = now() : now().year,month + latestStatBeginDate.day', () => {
        const latestStatBeginDate = '230131';
        const today = new Date(Date.UTC(2023, 1, 28, 0, 0, 1)); // 23.2.28 00:00:00
        const expectedOutput = '230228';
        vi.setSystemTime(today);
        expect(calculatePaymentMonth(latestStatBeginDate)).toBe(expectedOutput);
    });
});
