import init, { Compressor } from "../../../build/worker/gateway";

const ctx: Worker = self as any;

import { GatewayMessageType } from "./types";

function msg(t: GatewayMessageType, payload: string): string {
    return `{"t":${JSON.stringify(t)},"p":"${payload}"}`;
}

init().then(_wasm => {
    let ws = new WebSocket(`wss://${self.location.host}/api/v1/gateway?compress=true&encoding=json`);
    ws.binaryType = "arraybuffer";

    let comp = Compressor.create();
    let encoder = new TextEncoder();
    let decoder = new TextDecoder();

    ws.addEventListener('message', (msg) => {
        let decompressed = comp.decompress(msg.data);
        let decoded = decoder.decode(decompressed);
        let parsed = JSON.parse(decoded);

        console.log("New Message: ", parsed);
    });
}).catch(e => {
    console.log("Worker error: {}", e);
    ctx.postMessage(msg(GatewayMessageType.Error, e));
});