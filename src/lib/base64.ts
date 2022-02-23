/**
 * Largely borrowed from https://github.com/waitingsong/base64
 */

const LOOKUP: string[] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split('');

function tripletToBase64(pos: number): string {
    return LOOKUP[pos >> 18 & 0x3F] +
        LOOKUP[pos >> 12 & 0x3F] +
        LOOKUP[pos >> 6 & 0x3F] +
        LOOKUP[pos & 0x3F];
}

function encodeChunk(input: Uint8Array, start: number, end: number): string {
    const arrLen = Math.ceil((end - start) / 3),
        ret: string[] = new Array(arrLen);

    for(let i = start, curTriplet = 0; i < end; i += 3, curTriplet += 1) {
        ret[curTriplet] = tripletToBase64(
            (input[i] & 0xFF) << 16 |
            (input[i + 1] & 0xFF) << 8 |
            (input[i + 2] & 0xFF),
        );
    }

    return ret.join('');
}

export function encodeBase64(input: Uint8Array): string {
    const len = input.length,
        extraBytes = len % 3, // if we have 1 byte left, pad 2 bytes
        len2 = len - extraBytes,
        maxChunkLength = 12000, // must be multiple of 3
        parts: string[] = new Array(
            Math.ceil(len2 / maxChunkLength) + (extraBytes ? 1 : 0),
        );

    let curChunk = 0, tmp;

    // go through the array every three bytes, we'll deal with trailing stuff later
    for(let i = 0, nextI = 0; i < len2; i = nextI, curChunk++) {
        nextI = i + maxChunkLength;
        parts[curChunk] = encodeChunk(input, i, Math.min(nextI, len2));
    }

    // pad the end with zeros, but make sure to not forget the extra bytes
    if(extraBytes === 1) {
        tmp = input[len2] & 0xFF;

        parts[curChunk] =
            LOOKUP[tmp >> 2] +
            LOOKUP[tmp << 4 & 0x3F] + '==';

    } else if(extraBytes === 2) {
        tmp = (input[len2] & 0xFF) << 8 | (input[len2 + 1] & 0xFF);

        parts[curChunk] =
            LOOKUP[tmp >> 10] +
            LOOKUP[tmp >> 4 & 0x3F] +
            LOOKUP[tmp << 2 & 0x3F] + '=';
    }

    return parts.join('')
}

export function encodeUTF8toBase64(s: string): string {
    return encodeBase64((new TextEncoder()).encode(s));
}