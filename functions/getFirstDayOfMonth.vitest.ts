import { describe, it, expect, vi, afterEach } from 'vitest';
import { getFirstDayOfMonth } from './getFirstDayOfMonth';

describe('getFirstDayOfMonth', () => {
    afterEach(() => {
        vi.useRealTimers(); // 각 테스트 후에 타이머를 원래대로 복원합니다.
    });

    it('should return the first day of January 2023 in YYYYMMDD format', () => {
        vi.setSystemTime(new Date('2023-01-15T12:00:00Z')); // 2023년 1월 15일로 시간을 설정
        const result = getFirstDayOfMonth();
        const expectedDate = '20230101';
        expect(result).toBe(expectedDate);
    });

    it('should return the first day of December 2023 in YYYYMMDD format', () => {
        vi.setSystemTime(new Date('2023-12-25T12:00:00Z')); // 2023년 12월 25일로 시간을 설정
        const result = getFirstDayOfMonth();
        const expectedDate = '20231201';
        expect(result).toBe(expectedDate);
    });

    it('should return the first day of January 2024 in YYYYMMDD format', () => {
        vi.setSystemTime(new Date('2024-01-01T12:00:00Z')); // 2024년 1월 1일로 시간을 설정
        const result = getFirstDayOfMonth();
        const expectedDate = '20240101';
        expect(result).toBe(expectedDate);
    });

    it('should return the first day of February 2024 in YYYYMMDD format (leap year)', () => {
        vi.setSystemTime(new Date('2024-02-29T12:00:00Z')); // 2024년 2월 29일로 시간을 설정
        const result = getFirstDayOfMonth();
        const expectedDate = '20240201';
        expect(result).toBe(expectedDate);
    });

    it('should return the first day of the current month in YYYYMMDD format', () => {
        const currentDate = new Date();
        const year = currentDate.getUTCFullYear();
        const month = String(currentDate.getUTCMonth() + 1).padStart(2, '0');
        const expectedDate = `${year}${month}01`;
        const result = getFirstDayOfMonth();
        expect(result).toBe(expectedDate);
    });

    it('should handle different time zones correctly', () => {
        // UTC+9 (Korea Standard Time)
        vi.setSystemTime(new Date('2023-01-15T12:00:00+09:00'));
        let result = getFirstDayOfMonth();
        let expectedDate = '20230101';
        expect(result).toBe(expectedDate);

        // UTC-5 (Eastern Standard Time)
        vi.setSystemTime(new Date('2023-01-15T12:00:00-05:00'));
        result = getFirstDayOfMonth();
        expectedDate = '20230101';
        expect(result).toBe(expectedDate);

        // UTC+0 (Greenwich Mean Time)
        vi.setSystemTime(new Date('2023-01-15T12:00:00Z'));
        result = getFirstDayOfMonth();
        expectedDate = '20230101';
        expect(result).toBe(expectedDate);
    });
});
