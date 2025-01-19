'use client';
import { createClient } from '@/supabase/utils/client';

export async function runEmbedding() {
    const supabase = createClient();
    const { data } = await supabase.auth.getSession();
    if (data?.session?.user?.id) {
        const userId = data.session.user.id;
        await fetch(`/api/ai/embedding-user?user_id=${userId}`);
    }
}
