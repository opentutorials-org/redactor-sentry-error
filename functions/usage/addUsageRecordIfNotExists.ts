import { SupabaseClient } from '@supabase/supabase-js';

export async function addUsageRecordIfNotExists(supabase: SupabaseClient) {
    // 1. 행이 존재하는지 확인
    const { data: existingData, error: selectError } = await supabase.from('usage').select('*');

    if (!existingData || existingData.length > 0) {
        console.log('Usage record already exists:', existingData);
        return; // 이미 행이 존재하면 함수 종료
    }

    // 2. 존재하지 않으면 새로운 행 추가
    const { data, error } = await supabase.from('usage').insert([
        {
            status: 'ACTIVE', // 사용 중인 subscription_status enum 값에 맞게 수정
            plan_type: 'FREE', // 사용 중인 subscription_plan enum 값에 맞게 수정
            last_reset_date: new Date().toISOString(),
            next_reset_date: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(),
        },
    ]);

    if (error) {
        console.error('Error adding usage record:', error);
    } else {
        console.log('Added usage record:', data);
    }
}
