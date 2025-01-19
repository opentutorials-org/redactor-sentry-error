import { authLogger } from '@/debug/auth';
import { clearStorage } from '@/functions/clearStorage';
import { getUserType, setUserType } from '@/functions/getUserType';
import { createClient } from '@/supabase/utils/client';
import { NAMED } from '@/types';
import { captureException, captureMessage } from '@sentry/nextjs';
import { redirect } from 'next/navigation';

export async function ifLogoutClearAndRedirect() {
    if (getUserType()) {
        return true;
    }
    captureMessage(
        'ifLogoutClearAndRedirect 함수가 실행되었고 userType이 null이므로 로그인 상태를 확인합니다.'
    );
    try {
        const supabase = createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (user) {
            captureMessage('로그인 상태이므로 userType을 NAMED로 설정하고 종료합니다');
            setUserType(NAMED);
            return true;
        } else {
            captureMessage(
                '로그아웃 상태이므로 모든 데이터를 삭제하고 welcome 페이지로 이동합니다.'
            );
            clearStorage(
                'ifLogoutClearAndRedirect 호출, userType이 null이고 사용자 정보를 찾을 수 없어서 clearStorage 호출'
            );
            setTimeout(() => {
                redirect('/welcome');
            }, 500);
            return false;
        }
    } catch (error) {
        // 에러 처리 로직을 추가하세요.
        captureException(error);
        throw error;
    }
}
