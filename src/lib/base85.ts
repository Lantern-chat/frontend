const BYTE_OFFSETS = new Uint8Array([
    0x00, 0x44, 0x00, 0x54, 0x53, 0x52, 0x48, 0x00, 0x4B, 0x4C, 0x46, 0x41, 0x00, 0x3F, 0x3E, 0x45, 0x00,
    0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x40, 0x00, 0x49, 0x42, 0x4A, 0x47, 0x51, 0x24,
    0x25, 0x26, 0x27, 0x28, 0x29, 0x2A, 0x2B, 0x2C, 0x2D, 0x2E, 0x2F, 0x30, 0x31, 0x32, 0x33, 0x34, 0x35,
    0x36, 0x37, 0x38, 0x39, 0x3A, 0x3B, 0x3C, 0x3D, 0x4D, 0x00, 0x4E, 0x43, 0x00, 0x00, 0x0A, 0x0B, 0x0C,
    0x0D, 0x0E, 0x0F, 0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19, 0x1A, 0x1B, 0x1C, 0x1D,
    0x1E, 0x1F, 0x20, 0x21, 0x22, 0x23, 0x4F, 0x00, 0x50, 0x00, 0x00,
]);

const CHARS = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.-:+=^!/*?&<>()[]{}@%$#";

export function decode(enc: Uint8Array): ArrayBuffer {
    let out = new ArrayBuffer(enc.length / 5 * 4), pos = 0, w = 0, view = new DataView(out);
    while(pos < enc.length) {
        let next_pos = pos + 5, block_num = 0;
        while(pos < next_pos) {
            // if out of range, just set byte to 0 via `(0 | undefined)`
            block_num = block_num * 85 + (BYTE_OFFSETS[enc[pos++] - 32] | 0);
        }
        view.setInt32(w, block_num, false /* write Big-Endian to swap bytes */);
        w += 4; pos = next_pos;
    }
    return out;
}

export function encode(data: Uint8Array): string {
    let out = "", l = data.length;

    if(l > 0 && l % 4 == 0) {
        for(let offset = 0; offset < l; offset += 4) {
            let block_num = 0, stack = [], i = 5, byte = 0;

            while(byte < 4) {
                block_num = (block_num << 8) | data[offset + byte++];
            }

            // i = 5 as per above, so iterate 5 times
            while(i--) {
                stack.push(CHARS.charAt(block_num % 85));
                block_num /= 85;
            }

            // pop stack
            for(i = 5; i--;) {
                out += stack[i];
            }
        }
    }

    return out;
}