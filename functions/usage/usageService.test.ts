import { UsageService } from './usageService';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/database.types';
import { fetchUserId } from '@/supabase/utils/client';
import { usageLogger } from '@/debug/usage';
import { intervalToMilliseconds } from '@/functions/usage/intervalToMilliseconds';
import { fetchSubscriberData } from '@/app/api/usage/webhook/fetchSubscriberData';
import { DEFAULT_RESET_QUANTITY } from '../constants';

// jest.mock('@supabase/supabase-js');
// jest.mock('@/supabase/utils/client');
// jest.mock('@/debug/usage');
// jest.mock('@/functions/usage/intervalToMilliseconds');
// jest.mock('@/app/api/usage/webhook/fetchSubscriberData');
// jest.mock('../constants');

// describe('UsageService', () => {
//     let usageService: UsageService;
//     let supabaseClientMock: jest.Mocked<SupabaseClient<Database>>;

//     beforeEach(() => {
//         supabaseClientMock = {
//             from: jest.fn(),
//         } as any;

//         (intervalToMilliseconds as jest.Mock).mockReturnValue(2592000000); // 30일 밀리초
//         usageService = new UsageService(supabaseClientMock);
//     });

//     afterEach(() => {
//         jest.clearAllMocks();
//     });

//     describe('getUsage', () => {
//         it('사용량 정보를 성공적으로 가져와야 합니다', async () => {
//             const userId = 'test-user-id';
//             const usageData = {
//                 id: 1,
//                 user_id: userId,
//                 status: 'ACTIVE',
//                 next_reset_date: '2023-12-31',
//                 // 필요한 다른 필드들 추가
//             };

//             (fetchUserId as jest.Mock).mockResolvedValue(userId);
//             supabaseClientMock.from.mockReturnValue({
//                 select: jest.fn().mockReturnThis(),
//                 eq: jest.fn().mockResolvedValue({
//                     data: [usageData],
//                     error: null,
//                 }),
//             } as any);

//             const result = await usageService.getUsage();
//             expect(result).toEqual(usageData);
//         });

//         it('사용량 데이터가 없을 경우 에러를 발생시켜야 합니다', async () => {
//             const userId = 'test-user-id';

//             (fetchUserId as jest.Mock).mockResolvedValue(userId);
//             supabaseClientMock.from.mockReturnValue({
//                 select: jest.fn().mockReturnThis(),
//                 eq: jest.fn().mockResolvedValue({
//                     data: [],
//                     error: null,
//                 }),
//             } as any);

//             await expect(usageService.getUsage()).rejects.toThrow(
//                 '사용량 정보를 찾을 수 없습니다.'
//             );

//             expect(usageLogger).toHaveBeenCalledWith('사용량 데이터 없음');
//         });

//         it('Supabase 에러가 발생하면 에러를 발생시켜야 합니다', async () => {
//             const userId = 'test-user-id';
//             const error = new Error('Supabase error');

//             (fetchUserId as jest.Mock).mockResolvedValue(userId);
//             supabaseClientMock.from.mockReturnValue({
//                 select: jest.fn().mockReturnThis(),
//                 eq: jest.fn().mockResolvedValue({
//                     data: null,
//                     error: error,
//                 }),
//             } as any);

//             await expect(usageService.getUsage()).rejects.toThrow(
//                 '사용량 정보를 가져오는데 실패했습니다.'
//             );

//             expect(usageLogger).toHaveBeenCalledWith('사용량 정보 가져오기 실패', { error });
//         });

//         it('사용량 초과 상태인 경우 에러를 발생시켜야 합니다', async () => {
//             const userId = 'test-user-id';
//             const usageData = {
//                 id: 1,
//                 user_id: userId,
//                 status: 'INACTIVE_FREE_USAGE_EXCEEDED',
//                 next_reset_date: '2023-12-31',
//             };

//             (fetchUserId as jest.Mock).mockResolvedValue(userId);
//             supabaseClientMock.from.mockReturnValue({
//                 select: jest.fn().mockReturnThis(),
//                 eq: jest.fn().mockResolvedValue({
//                     data: [usageData],
//                     error: null,
//                 }),
//             } as any);

//             await expect(usageService.getUsage()).rejects.toThrow(
//                 `월간 사용량이 초과되었습니다. 다음 초기화 일자: ${usageData.next_reset_date}`
//             );

//             expect(usageLogger).toHaveBeenCalledWith('사용량 초과', { status: usageData.status });
//         });

//         it('구독 갱신 실패 상태인 경우 에러를 발생시켜야 합니다', async () => {
//             const userId = 'test-user-id';
//             const usageData = {
//                 id: 1,
//                 user_id: userId,
//                 status: 'INACTIVE_EXPIRED_AUTO_RENEW_FAIL',
//             };

//             (fetchUserId as jest.Mock).mockResolvedValue(userId);
//             supabaseClientMock.from.mockReturnValue({
//                 select: jest.fn().mockReturnThis(),
//                 eq: jest.fn().mockResolvedValue({
//                     data: [usageData],
//                     error: null,
//                 }),
//             } as any);

//             await expect(usageService.getUsage()).rejects.toThrow(
//                 '구독 갱신에 실패했습니다. 결제 정보를 확인해주세요.'
//             );

//             expect(usageLogger).toHaveBeenCalledWith('구독 갱신 실패', {
//                 status: usageData.status,
//             });
//         });
//     });

//     describe('resetUsage', () => {
//         it('사용자 ID로 사용량을 초기화해야 합니다', async () => {
//             const userId = 'test-user-id';
//             const usageData = { user_id: userId };
//             supabaseClientMock.from.mockReturnValue({
//                 select: jest.fn().mockReturnThis(),
//                 eq: jest.fn().mockResolvedValue({
//                     data: [usageData],
//                     error: null,
//                 }),
//             } as any);

//             jest.spyOn(usageService, 'resetUsageForUser').mockResolvedValue();

//             const result = await usageService.resetUsage(userId);

//             expect(usageLogger).toHaveBeenCalledWith(`사용자 ${userId}의 사용량을 초기화합니다.`);
//             expect(usageService.resetUsageForUser).toHaveBeenCalledWith(
//                 usageData,
//                 expect.any(Object)
//             );
//         });

//         it('next_reset_date 이전의 사용자를 초기화해야 합니다', async () => {
//             const usageData = [{ user_id: 'user1' }, { user_id: 'user2' }];
//             supabaseClientMock.from.mockReturnValue({
//                 select: jest.fn().mockReturnThis(),
//                 lte: jest.fn().mockReturnThis(),
//                 limit: jest.fn().mockResolvedValue({
//                     data: usageData,
//                     error: null,
//                 }),
//             } as any);

//             jest.spyOn(usageService, 'resetUsageForUser').mockResolvedValue();

//             const result = await usageService.resetUsage();

//             expect(usageLogger).toHaveBeenCalled();
//             expect(usageService.resetUsageForUser).toHaveBeenCalledTimes(usageData.length);
//         });
//     });

//     describe('getPlanTypeAndStore', () => {
//         it('식별자에 따라 올바른 플랜 타입과 스토어를 반환해야 합니다', () => {
//             expect(usageService.getPlanTypeAndStore('5-monthly')).toEqual({
//                 plan_type: 'MONTHLY',
//                 store: 'play_store',
//             });
//             expect(usageService.getPlanTypeAndStore('6-yearly')).toEqual({
//                 plan_type: 'YEARLY',
//                 store: 'play_store',
//             });
//             expect(usageService.getPlanTypeAndStore('ios_monthly_subscription')).toEqual({
//                 plan_type: 'MONTHLY',
//                 store: 'app_store',
//             });
//             expect(usageService.getPlanTypeAndStore('unknown')).toEqual({
//                 plan_type: 'FREE',
//                 store: null,
//             });
//         });
//     });

//     // 다른 메서드에 대한 테스트도 작성 가능합니다
// });
