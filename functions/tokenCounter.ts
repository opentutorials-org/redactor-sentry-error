import { TiktokenModel, encodingForModel } from 'js-tiktoken';
export function tokenCounter(str: string, model: TiktokenModel) {
    const encoding = encodingForModel(model);
    const tokens = encoding.encode(str).length;
    return tokens;
}
