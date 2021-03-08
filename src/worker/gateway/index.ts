import init, { Compressor } from "../../../build/worker/gateway";

const ctx: Worker = self as any;

import { GatewayMessageType } from "./types";

function msg(t: GatewayMessageType, payload: string): string {
    let ts = JSON.stringify(t);
    return `{"t":${ts},"p":"${payload}"}`;
}

init().then(_wasm => {
    let ws = new WebSocket(`wss://${self.location.host}/api/v1/gateway`);

    let comp = Compressor.create();
    let encoder = new TextEncoder();
    let decoder = new TextDecoder();


    let msg = `Test Test Test Test Test Test Test Test `;
    let encoded = encoder.encode(msg);
    let compressed = comp.compress(encoded);

    console.log("Raw: ", encoded.length)
    console.log("Compressed: ", compressed.length);
}).catch(e => {
    console.log("Worker error: {}", e);
    ctx.postMessage(msg(GatewayMessageType.Error, e));
});