// Legacy implementation for 32-bit + number types
export function fnv1a(string: string): number {
    // Handle Unicode code points > 0x7f
    let hash = 2166136261;
    let isUnicoded = false;

    for(let i = 0; i < string.length; i++) {
        let characterCode = string.charCodeAt(i);

        // Non-ASCII characters trigger the Unicode escape logic
        if(characterCode > 0x7F && !isUnicoded) {
            string = unescape(encodeURIComponent(string));
            characterCode = string.charCodeAt(i);
            isUnicoded = true;
        }

        hash ^= characterCode;
        hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }

    return hash >>> 0;
}