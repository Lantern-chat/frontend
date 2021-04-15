import init, { Compressor, InitOutput } from "../../../build/worker/gateway";

const ctx: Worker = self as any;

import { GatewayMessageType } from "./types";

function post_msg(t: GatewayMessageType, payload?: string) {
    ctx.postMessage(`{"t":${t.toString()}` + (payload ? `,"p":"${payload}"}` : '}'));
}

var WASM: InitOutput;

init().then(wasm => {
    WASM = wasm;
    post_msg(GatewayMessageType.Init);
}).catch(e => {
    post_msg(GatewayMessageType.Error, e);
});

var GATEWAY: Gateway | undefined;

ctx.addEventListener('message', msg => {
    if(!WASM) {
        return post_msg(GatewayMessageType.Error, "Not Ready");
    }

    let data = msg.data;
    if(typeof data === 'string') {
        data = JSON.parse(data);
    }

});

class Gateway {
    ws: WebSocket;
    comp: Compressor;
    encoder: TextEncoder;
    decoder: TextDecoder;

    // heartbeat interval
    hbi: number = 0;

    // heartbeat interval timer
    hbt: number | undefined;

    // waiting on heartbeat ACK
    hbw: boolean = false;

    constructor() {
        post_msg(GatewayMessageType.Connecting);

        this.ws = new WebSocket(`wss://${self.location.host}/api/v1/gateway?compress=true&encoding=json`);
        this.ws.binaryType = "arraybuffer";

        this.comp = Compressor.create();
        this.encoder = new TextEncoder();
        this.decoder = new TextDecoder();

        this.ws.addEventListener('open', () => post_msg(GatewayMessageType.Connected));

        this.ws.addEventListener('message', msg => {
            let decompressed = this.comp.decompress(msg.data);
            let decoded = this.decoder.decode(decompressed);
            let parsed = JSON.parse(decoded);

            this.processMsg(parsed);
        });

        // TODO: Handle this with heartbeat and stuff
        this.ws.addEventListener('close', msg => post_msg(GatewayMessageType.Disconnected, msg.code.toString()));
    }

    // TODO: Memoize?
    send(value: any) {
        let str = JSON.stringify(value);
        let encoded = this.encoder.encode(str);
        let compressed = this.comp.compress(encoded);

        this.ws.send(compressed);
    }

    processMsg(msg: any) {
        switch(msg.o) {
            // HELLO
            case 0: {
                this.hbi = msg.heartbeat_inverval;
                this.hbt = setInterval(() => this.hb(), this.hbi) as any;

                return this.identify();
            }
            // HEARTBEAT ACK
            case 2: {
                this.hbw = false;
            }
        }
    }

    hb() {
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

    identify() {

    }
}