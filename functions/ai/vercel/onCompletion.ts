import { tokenCounter } from '@/functions/tokenCounter';
import { createClient } from '@/supabase/utils/server';
import { add_api_usage_raw } from './add_api_usage_raw';
import { aiLogger } from '@/debug/ai';

const MODEL_INPUT_MODEL_TYPE_ID = 17;
const MODEL_INPUT_MODEL_TYPE_PRICE = 0.0000025;
const MODEL_OUTPUT_MODEL_TYPE_ID = 18;
const MODEL_OUTPUT_MODEL_TYPE_PRICE = 0.00001;

/**
 * Handles the completion of an AI request by logging usage and costs.
 * @param userId - The ID of the user making the request.
 * @param inputMessages - The input messages sent to the AI.
 * @param usagePurpose - The purpose of the usage.
 * @param tokenCounter - Function to count tokens in a message.
 * @returns A function to handle the completion.
 */
export function handleCompletion(
    userId: string,
    inputMessages: string,
    usagePurpose: number,
    tokenCounter: (message: string) => number
) {
    return async (completion: string) => {
        const logUsage = async (
            apiTypeId: number,
            tokens: number,
            price: number,
            content: string
        ) => {
            const currentUnixTimestamp = Date.now().toString();
            const usageData = {
                api_type_id: apiTypeId,
                amount: tokens,
                total_cost: tokens * price,
                usage_purpose: usagePurpose,
                created_at: currentUnixTimestamp,
            };
            aiLogger('handleCompletion', 'usageData', { ...usageData, content });
            await add_api_usage_raw([usageData], userId);
        };

        const inputTokens = tokenCounter(inputMessages);
        const outputTokens = tokenCounter(completion);

        await logUsage(
            MODEL_INPUT_MODEL_TYPE_ID,
            inputTokens,
            MODEL_INPUT_MODEL_TYPE_PRICE,
            inputMessages
        );
        await logUsage(
            MODEL_OUTPUT_MODEL_TYPE_ID,
            outputTokens,
            MODEL_OUTPUT_MODEL_TYPE_PRICE,
            completion
        );
    };
}
