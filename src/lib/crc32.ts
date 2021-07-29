// Based on https://github.com/SheetJS/js-crc32

function signed_crc_table(): Int32Array | Array<number> {
    let c, table = new Array(256), n = 0;

    for(; n != 256;) {
        c = ++n;
        c = ((c & 1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
        c = ((c & 1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
        c = ((c & 1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
        c = ((c & 1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
        c = ((c & 1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
        c = ((c & 1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
        c = ((c & 1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
        c = ((c & 1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
        table[n] = c;
    }

    return typeof Int32Array !== 'undefined' ? new Int32Array(table) : table;
}

const T: Int32Array | Array<number> = signed_crc_table();

/// assumes the argument is a binary string where byte i is the low byte of the UCS-2 char: `str.charCodeAt(i) & 0xFF`
export function crc32_bstr(bstr: string, seed?: number): number {
    var C = seed as number ^ -1, L = bstr.length - 1;
    for(var i = 0; i < L;) {
        C = (C >>> 8) ^ T[(C ^ bstr.charCodeAt(i++)) & 0xFF];
        C = (C >>> 8) ^ T[(C ^ bstr.charCodeAt(i++)) & 0xFF];
    }
    if(i === L) C = (C >>> 8) ^ T[(C ^ bstr.charCodeAt(i)) & 0xFF];
    return C ^ -1;
}

export function crc32_buf(buf: Uint8Array, seed?: number): number {
    if(buf.length > 10000) return crc32_buf_8(buf, seed);
    var C = seed as number ^ -1, L = buf.length - 3;
    for(var i = 0; i < L;) {
        C = (C >>> 8) ^ T[(C ^ buf[i++]) & 0xFF];
        C = (C >>> 8) ^ T[(C ^ buf[i++]) & 0xFF];
        C = (C >>> 8) ^ T[(C ^ buf[i++]) & 0xFF];
        C = (C >>> 8) ^ T[(C ^ buf[i++]) & 0xFF];
    }
    while(i < L + 3) C = (C >>> 8) ^ T[(C ^ buf[i++]) & 0xFF];
    return C ^ -1;
}

export function crc32_buf_8(buf: Uint8Array, seed?: number): number {
    var C = seed as number ^ -1, L = buf.length - 7;
    for(var i = 0; i < L;) {
        C = (C >>> 8) ^ T[(C ^ buf[i++]) & 0xFF];
        C = (C >>> 8) ^ T[(C ^ buf[i++]) & 0xFF];
        C = (C >>> 8) ^ T[(C ^ buf[i++]) & 0xFF];
        C = (C >>> 8) ^ T[(C ^ buf[i++]) & 0xFF];
        C = (C >>> 8) ^ T[(C ^ buf[i++]) & 0xFF];
        C = (C >>> 8) ^ T[(C ^ buf[i++]) & 0xFF];
        C = (C >>> 8) ^ T[(C ^ buf[i++]) & 0xFF];
        C = (C >>> 8) ^ T[(C ^ buf[i++]) & 0xFF];
    }
    while(i < L + 7) C = (C >>> 8) ^ T[(C ^ buf[i++]) & 0xFF];
    return C ^ -1;
}

/// assumes the argument is a standard JS string and calculates the hash of the UTF-8 encoding.
export function crc32_str(str: string, seed?: number): number {
    var C = seed as number ^ -1;
    for(var i = 0, L = str.length, c, d; i < L;) {
        c = str.charCodeAt(i++);
        if(c < 0x80) {
            C = (C >>> 8) ^ T[(C ^ c) & 0xFF];
        } else if(c < 0x800) {
            C = (C >>> 8) ^ T[(C ^ (192 | ((c >> 6) & 31))) & 0xFF];
            C = (C >>> 8) ^ T[(C ^ (128 | (c & 63))) & 0xFF];
        } else if(c >= 0xD800 && c < 0xE000) {
            c = (c & 1023) + 64; d = str.charCodeAt(i++) & 1023;
            C = (C >>> 8) ^ T[(C ^ (240 | ((c >> 8) & 7))) & 0xFF];
            C = (C >>> 8) ^ T[(C ^ (128 | ((c >> 2) & 63))) & 0xFF];
            C = (C >>> 8) ^ T[(C ^ (128 | ((d >> 6) & 15) | ((c & 3) << 4))) & 0xFF];
            C = (C >>> 8) ^ T[(C ^ (128 | (d & 63))) & 0xFF];
        } else {
            C = (C >>> 8) ^ T[(C ^ (224 | ((c >> 12) & 15))) & 0xFF];
            C = (C >>> 8) ^ T[(C ^ (128 | ((c >> 6) & 63))) & 0xFF];
            C = (C >>> 8) ^ T[(C ^ (128 | (c & 63))) & 0xFF];
        }
    }
    return C ^ -1;
}