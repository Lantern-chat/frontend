import init, { Compressor, InitOutput } from "../../../build/worker/gateway";

const ctx: Worker = self as any;

import { GatewayMessageDiscriminator } from "./msg";
import { GatewayCommand, GatewayCommandDiscriminator } from "./cmd";
import { GatewayEvent, GatewayEventCode } from "./event";
import { GatewayClientCommand, GatewayClientCommandDiscriminator } from "./client";

function post_msg(t: GatewayMessageDiscriminator, payload?: string) {
    ctx.postMessage(`{"t":${t.toString()}` + (payload ? `,"p":"${payload}"}` : '}'));
}

var WASM: InitOutput, GATEWAY: Gateway;

init().then(wasm => {
    WASM = wasm;
    GATEWAY = new Gateway();

    post_msg(GatewayMessageDiscriminator.Initialized);
}).catch(e => {
    post_msg(GatewayMessageDiscriminator.Error, JSON.stringify(e));
});

ctx.addEventListener('message', msg => {
    if(!WASM) {
        return post_msg(GatewayMessageDiscriminator.Error, "Not Ready");
    }

    let data: GatewayCommand = msg.data;
    if(typeof data === 'string') {
        data = JSON.parse(data);
    }

    switch(data.t) {
        case GatewayCommandDiscriminator.Connect: {
            GATEWAY.auth = data.auth;
            GATEWAY.connect();
            break;
        }
        case GatewayCommandDiscriminator.Disconnect: {
            GATEWAY.auth = null;
            GATEWAY.disconnect();
            break;
        }
        default: {
            console.error("Unknown command: ", data);
        }
    }
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

    attempt: number = 0;

    constructor() {
        this.comp = Compressor.create();
        this.encoder = new TextEncoder();
        this.decoder = new TextDecoder();
    }

    connect() {
        let delay = this.attempt ? (1 << this.attempt) * 8000 : 0;

        console.log("DELAY: ", delay);

        setTimeout(() => {
            post_msg(GatewayMessageDiscriminator.Connecting);

            this.ws = new WebSocket(`wss://${self.location.host}/api/v1/gateway?compress=true&encoding=json`);
            this.ws.binaryType = "arraybuffer";

            this.ws.addEventListener('open', () => this.on_open());
            this.ws.addEventListener('message', msg => this.on_msg(msg.data));
            this.ws.addEventListener('close', msg => this.on_close(msg));
            this.ws.addEventListener('error', err => this.on_error(err));
        }, delay);

        this.attempt += 1;
    }

    // TODO: Memoize?
    send(value: GatewayClientCommand) {
        if(!this.ws) {
            return post_msg(GatewayMessageDiscriminator.Error, "WebSocket undefined");
        }

        console.log("SENDING: ", value);

        let str = JSON.stringify(value);
        let encoded = this.encoder.encode(str);
        let compressed = this.comp.compress(encoded);

        this.ws.send(compressed);
    }

    on_close(msg: CloseEvent) {
        post_msg(GatewayMessageDiscriminator.Disconnected, msg.code.toString());

        this.ws = null;
        this.hbw = false;
        clearInterval(this.hbi); // clear heartbeat
    }

    on_error(_err: Event) {
        // TODO: Handle this as a close event?
        post_msg(GatewayMessageDiscriminator.Error, "WS Error");
    }

    on_open() {
        this.attempt = 0;

        post_msg(GatewayMessageDiscriminator.Connected);
        // NOTE: Nothing else to do on open except wait for the Hello event
    }

    on_msg(raw: ArrayBuffer) {
        let decompressed = this.comp.decompress(raw);
        let decoded = this.decoder.decode(decompressed);
        let msg: GatewayEvent = JSON.parse(decoded);

        switch(msg.o) {
            case GatewayEventCode.Hello: {
                console.log("GATEWAY: HELLO", msg);
                this.hbi = msg.p.heartbeat_interval || 45000;
                this.hbt = setInterval(() => this.heartbeat(), this.hbi) as any;

                this.identify();

                break;
            }
            case GatewayEventCode.HeartbeatACK: {
                console.log("GATEWAY: ACK", msg);
                this.hbw = false;
                break;
            }
            case GatewayEventCode.Ready: {
                console.log("GATEWAY READY", msg);
                break;
            }
            default: {
                console.log("GATEWAY UNKNOWN", msg);
            }
        }
    }

    heartbeat() {
        this.hbw = true;

        this.send({ o: GatewayClientCommandDiscriminator.Heartbeat });

        // in hbi milliseconds, check if an ACK has been received or disconnect/reconnect
        setTimeout(() => {
            if(this.hbw) { this.disconnect() }
        }, this.hbi);
    }

    disconnect() {
        if(this.ws) {
            // NOTE: This should trigger `on_close`
            this.ws.close();
        }
    }

    identify() {
        this.send({ o: GatewayClientCommandDiscriminator.Identify, p: { auth: this.auth!, intent: 0 } });
    }
}