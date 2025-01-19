'use client';
export function extractBodyInfo(body: string) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(body, 'text/html');
    const text = doc.body.innerText;
    const length = text.length;
    const img = doc.querySelector('img');
    const img_url = img ? img.src : null;

    return { length, img_url };
}
