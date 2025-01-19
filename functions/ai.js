// @ts-ignore
export async function createEmbeddingUsingCohere(text, input_type = 'search_query') {
    try {
        const bodyContent = {
            model: 'embed-multilingual-v3.0',
            texts: [text],
            truncate: 'NONE',
            input_type: input_type,
        };

        const response = await fetch('https://api.cohere.ai/v1/embed', {
            headers: {
                'content-type': 'application/json; charset=UTF-8',
                authorization: `Bearer ${process.env.COHERE_API_KEY}`,
            },
            body: JSON.stringify(bodyContent),
            method: 'POST',
            mode: 'cors',
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error(`Network response was not ok, status: ${response.status}`);
        }

        const data = await response.json();

        if (!data) {
            throw new Error('Response data is undefined');
        }

        return data;
    } catch (e) {
        console.error(e);
        throw e; // 에러를 다시 던져서 이 함수를 호출한 곳에서도 에러를 처리할 수 있게 합니다.
    }
}

export async function fetchTitling(id, body) {
    const response = await fetch('/api/ai/titling', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, body: body }),
    });
    const responseData = await response.json();
    return responseData;
}
