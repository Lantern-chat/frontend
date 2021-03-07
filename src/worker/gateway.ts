import init, { Compressor } from "../../build/worker/gateway";

const ctx: Worker = self as any;

class Gateway {
    host: string;
    comp: Compressor = Compressor.create();
    encoder: TextEncoder = new TextEncoder();
    decoder: TextDecoder = new TextDecoder();

    constructor(host: string) {
        this.host = host;
    }
}

enum GatewayMessageType {
    Message,
    Error,
}

function msg(t: GatewayMessageType, payload: any) {
    return { t, p: payload };
}

init().then(wasm => {
    let gw = new Gateway("test");

    let msg = `Test Test Test Test Test Test Test Test `;
    let encoded = gw.encoder.encode(msg);
    let compressed = gw.comp.compress(encoded);

    console.log("Raw: ", encoded.length)
    console.log("Compressed: ", compressed.length);
}).catch(e => {
    ctx.postMessage(msg(GatewayMessageType.Error, e));
});