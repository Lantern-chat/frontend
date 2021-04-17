import init, { Compressor, InitOutput } from "../../../build/worker/gateway";

const ctx: Worker = self as any;

import { GatewayMessageType, GatewayCommand, GatewayCommandType } from "./types";

function post_msg(t: GatewayMessageType, payload?: string) {
    ctx.postMessage(`{"t":${t.toString()}` + (payload ? `,"p":"${payload}"}` : '}'));
}

var WASM: InitOutput, GATEWAY: Gateway;

init().then(wasm => {
    WASM = wasm;
    GATEWAY = new Gateway();

    post_msg(GatewayMessageType.Initialized);
}).catch(e => {
    post_msg(GatewayMessageType.Error, JSON.stringify(e));
});

ctx.addEventListener('message', msg => {
    if(!WASM) {
        return post_msg(GatewayMessageType.Error, "Not Ready");
    }

    let data: GatewayCommand = msg.data;
    if(typeof data === 'string') {
        data = JSON.parse(data);
    }

    console.log(data);

    switch(data.t) {
        case GatewayCommandType.Connect: {
            GATEWAY.connect();
        }
        //case GatewayCommandType.Identify: {
        //    GATEWAY.identify(data.p);
        //}
    }

    // TODO: Receive commands from main thread
});

class Gateway {
    comp: Compressor;
    encoder: TextEncoder;
    decoder: TextDecoder;

    ws: WebSocket | null = null;

    // heartbeat interval
    hbi: number = 45000;

    // heartbeat interval timer
    hbt: number | undefined;

    // waiting on heartbeat ACK
    hbw: boolean = false;

    auth: string | null = null;

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

        console.log("SENDING: ", value);

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
                console.log("GATEWAY: HELLO", msg);
                this.hbi = msg.p.heartbeat_interval || 45000;
                this.hbt = setInterval(() => this.heartbeat(), this.hbi) as any;

                //return this.identify();

                break;
            }
            // HEARTBEAT ACK
            case 2: {
                console.log("GATEWAY: ACK", msg);
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