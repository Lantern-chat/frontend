import init, { Compressor, InitOutput } from "../../../build/worker/gateway";

const ctx: Worker = self as any;

import { GatewayMessageType } from "./types";

function post_msg(t: GatewayMessageType, payload?: string) {
    ctx.postMessage(`{"t":${t.toString()}` + (payload ? `,"p":"${payload}"}` : '}'));
}

var WASM: InitOutput, GATEWAY: Gateway;

init().then(wasm => {
    WASM = wasm;
    post_msg(GatewayMessageType.Init);

    GATEWAY = new Gateway();
}).catch(e => {
    post_msg(GatewayMessageType.Error, JSON.stringify(e));
});

ctx.addEventListener('message', msg => {
    if(!WASM) {
        return post_msg(GatewayMessageType.Error, "Not Ready");
    }

    let data = msg.data;
    if(typeof data === 'string') {
        data = JSON.parse(data);
    }

    // TODO: Receive commands from main thread
});

class Gateway {
    comp: Compressor;
    encoder: TextEncoder;
    decoder: TextDecoder;

    ws: WebSocket | null = null;

    // heartbeat interval
    hbi: number = 0;

    // heartbeat interval timer
    hbt: number | undefined;

    // waiting on heartbeat ACK
    hbw: boolean = false;

    constructor() {
        this.comp = Compressor.create();
        this.encoder = new TextEncoder();
        this.decoder = new TextDecoder();
    }

    connect() {
        post_msg(GatewayMessageType.Connecting);

        this.ws = new WebSocket(`wss://${self.location.host}/api/v1/gateway?compress=true&encoding=json`);
        this.ws.binaryType = "arraybuffer";

        this.ws.addEventListener('open', () => post_msg(GatewayMessageType.Connected));
        this.ws.addEventListener('message', msg => this.processMsg(msg.data));

        // TODO: Handle this with heartbeat and stuff
        this.ws.addEventListener('close', msg => post_msg(GatewayMessageType.Disconnected, msg.code.toString()));
        this.ws.addEventListener('error', _err => post_msg(GatewayMessageType.Error, "WS Error"));
    }

    // TODO: Memoize?
    send(value: any) {
        if(!this.ws) {
            return post_msg(GatewayMessageType.Error, "WebSocket undefined");
        }

        let str = JSON.stringify(value);
        let encoded = this.encoder.encode(str);
        let compressed = this.comp.compress(encoded);

        this.ws.send(compressed);
    }

    processMsg(raw: ArrayBuffer) {
        let decompressed = this.comp.decompress(raw);
        let decoded = this.decoder.decode(decompressed);
        let msg = JSON.parse(decoded);

        switch(msg.o) {
            // HELLO
            case 0: {
                this.hbi = msg.p.heartbeat_inverval;
                this.hbt = setInterval(() => this.heartbeat(), this.hbi) as any;

                //return this.identify();

                break;
            }
            // HEARTBEAT ACK
            case 2: {
                this.hbw = false;
                break;
            }
        }
    }

    heartbeat() {
        this.hbw = true;
        // Send heartbeat
        this.send({ o: 0 });

        // in hbi milliseconds, check if an ACK has been received or disconnect/reconnect
        setTimeout(() => {
            if(this.hbw) {
                // TODO: handle missed heartbeat ACK and disconnect
            }
        }, this.hbi);
    }

    identify(auth: string) {
        this.send({ o: 1, p: { auth } });
    }
}