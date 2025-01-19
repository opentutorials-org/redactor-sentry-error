import { pool } from '@/database.connection';
import { TEST_USER_ID } from '../../constants';
import { paymentTestLogger } from '@/debug/payment';

export async function createTestUser() {
    paymentTestLogger('테스트 유저 생성 - createTestUser', { TEST_USER_ID });
    const client = await pool.connect();
    await client.query(`INSERT INTO auth.users (id) VALUES ($1)`, [TEST_USER_ID]);
    await client.release();
}

export async function deleteTestUser() {
    paymentTestLogger('테스트 유저 삭제 - deleteTestUser', { TEST_USER_ID });
    const client = await pool.connect();
    await client.query('DELETE FROM auth.users WHERE id = $1', [TEST_USER_ID]);
    await client.release();
}
