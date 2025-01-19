import { contextMessage, similarityResponse } from '@/jotai';

export type askLLMRequestType = {
    message: string;
    references: similarityResponse[];
    history: contextMessage[];
    model: string;
};
