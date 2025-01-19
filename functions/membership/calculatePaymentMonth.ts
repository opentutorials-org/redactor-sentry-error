/**
 * 주어진 날짜 문자열을 기준으로 결제 월을 계산하여 반환합니다.
 *
 * @param {string} latestStatBeginDate - 결제 시작 날짜를 나타내는 문자열 (YYMMDD 형식)
 * @returns {string} - 결제 월을 나타내는 문자열 (YYMMDD 형식)
 * @throws {Error} - 입력 날짜가 현재 날짜보다 미래일 경우 예외를 던집니다.
 *
 * 주요 로직:
 * - 입력 날짜가 현재 날짜보다 미래일 경우 예외를 던집니다.
 * - 입력 날짜가 현재 날짜로부터 1개월 이내인 경우 입력 날짜를 그대로 반환합니다.
 * - 입력 날짜에 한 달을 더했을 때 다음 달에 해당 날짜가 존재하지 않는 경우 마지막 날로 조정합니다.
 * - 현재 날짜를 기준으로 조정된 결제 날짜를 반환합니다.
 *
 * 예시:
 * - latestStatBeginDate가 '230702'이고, 현재 날짜가 '2023-07-01'일 경우 예외를 던집니다.
 * - latestStatBeginDate가 '230701'이고, 현재 날짜가 '2023-07-29'일 경우 '230701'을 반환합니다.
 * - latestStatBeginDate가 '230701'이고, 현재 날짜가 '2023-08-01'일 경우 '230701'을 반환합니다.
 * - latestStatBeginDate가 '230701'이고, 현재 날짜가 '2023-08-02'일 경우 '230801'을 반환합니다.
 */
export function calculatePaymentMonth(latestStatBeginDate: string): string {
    // 주어진 날짜 형식에서 년, 월, 일을 추출
    const year = 2000 + parseInt(latestStatBeginDate.slice(0, 2), 10);
    const month = parseInt(latestStatBeginDate.slice(2, 4), 10) - 1; // 월은 0부터 시작
    const day = parseInt(latestStatBeginDate.slice(4, 6), 10);

    // 현재 시간 (UTC)
    const today = new Date();
    const inputDate = new Date(Date.UTC(year, month, day));

    // 입력 날짜가 현재 날짜보다 빠르면 예외 던지기
    if (inputDate > today) {
        throw new Error('latestStatBeginDate은 now() 보다 앞서야 합니다');
    }

    // 현재 시간을 기준으로 한 달 후의 날짜를 계산
    const inputPlus1m = new Date(inputDate);
    inputPlus1m.setUTCMonth(inputPlus1m.getUTCMonth() + 1);

    // 날짜가 월을 넘어가는 경우 마지막 날로 조정
    if (inputPlus1m.getUTCDate() !== inputDate.getUTCDate()) {
        inputPlus1m.setUTCDate(0);
    }

    // 입력 날짜가 현재 시간에서 1개월 이하면 그대로 반환
    if (inputPlus1m >= today) {
        return latestStatBeginDate;
    }

    // 현재 시간의 년, 월, latestStatBeginDate의 일을 조합하여 반환
    const paymentYearStr = String(today.getUTCFullYear() % 100).padStart(2, '0');
    const paymentMonthStr = String(today.getUTCMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 1을 더합니다

    // 현재 월의 마지막 날 계산
    const lastDayOfMonth = new Date(
        Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 0)
    ).getUTCDate();
    const paymentDay = Math.min(day, lastDayOfMonth);
    const paymentDayStr = String(paymentDay).padStart(2, '0');

    return `${paymentYearStr}${paymentMonthStr}${paymentDayStr}`;
}
