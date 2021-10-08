const ctx: Worker = self as any;

import { zlibSync as compress, unzlibSync as decompress } from 'fflate';

import { GatewayMessage, GatewayMessageDiscriminator } from "./msg";
import { GatewayCommand, GatewayCommandDiscriminator } from "./cmd";
import { GatewayEvent, GatewayEventCode } from "./event";
import { GatewayClientCommand, GatewayClientCommandDiscriminator } from "./client";
import { IS_MOBILE } from 'lib/user_agent';

__DEV__ && console.log("!!!!!GATEWAY LOADED!!!!!");

function postMsg(msg: GatewayMessage) {
    ctx.postMessage(msg);
}

class Gateway {
    encoder: TextEncoder;
    decoder: TextDecoder;

    ws: WebSocket | null = null;

    // heartbeat interval
    heartbeat_interval: number = 45000;

    // heartbeat interval timer
    heartbeat_timer?: number;

    heartbeat_timeout?: number;

    auth: string | null = null;
    intent: number = 0;

    attempt: number = 0;

    connecting_timeout?: number;

    constructor() {
        this.encoder = new TextEncoder();
        this.decoder = new TextDecoder();
    }

    connect() {
        if(!this.ws) {
            if(this.connecting_timeout !== undefined) {
                return this.retry_now();
            }

            let delay = this.attempt ? 1000 : 0;

            __DEV__ && console.log("DELAY: ", delay);

            if(delay > 0) {
                postMsg({ t: GatewayMessageDiscriminator.Waiting, p: Date.now() + delay })
            }

            this.connecting_timeout = <any>setTimeout(() => this.do_connect(), delay);
            this.attempt += 1;
        }
    }

    do_connect() {
        postMsg({ t: GatewayMessageDiscriminator.Connecting });

        this.ws = new WebSocket(`wss://${self.location.host}/api/v1/gateway?compress=true&encoding=json`);
        this.ws.binaryType = "arraybuffer";

        this.ws.addEventListener('open', () => this.on_open());
        this.ws.addEventListener('message', msg => this.on_msg(msg.data));
        this.ws.addEventListener('close', msg => this.on_close(msg));
        this.ws.addEventListener('error', err => this.on_error(err));
    }

    retry_now() {
        clearTimeout(this.connecting_timeout);
        this.connecting_timeout = undefined;
        this.do_connect();
    }

    // TODO: Memoize?
    send(value: GatewayClientCommand) {
        if(!this.ws) {
            return postMsg({ t: GatewayMessageDiscriminator.Error, p: { err: "WebSocket undefined" } });
        }

        __DEV__ && console.log("SENDING: ", value);

        let str = JSON.stringify(value);
        let encoded = this.encoder.encode(str);
        let compressed = compress(encoded);

        this.ws.send(compressed);
    }

    do_close() {
        if(this.ws) {
            this.ws = null;
            clearTimeout(this.heartbeat_timeout);
            clearInterval(this.heartbeat_timer); // clear heartbeat
        }
    }

    on_close(msg: CloseEvent) {
        __DEV__ && console.log("GATEWAY CLOSED");
        this.do_close();
        postMsg({ t: GatewayMessageDiscriminator.Disconnected, p: msg.code });
    }

    on_error(_err: Event) {
        __DEV__ && console.log("GATEWAY ERROR: ", _err);

        // TODO: Handle this as a close event?
        this.do_close();
        postMsg({ t: GatewayMessageDiscriminator.Error, p: { err: "WS Error" } });
    }

    on_open() {
        this.attempt = 0;

        postMsg({ t: GatewayMessageDiscriminator.Connected });
        // NOTE: Nothing else to do on open except wait for the Hello event
    }

    on_msg(raw: ArrayBuffer) {
        let decompressed = decompress(new Uint8Array(raw));
        let decoded = this.decoder.decode(decompressed);
        let msg: GatewayEvent = JSON.parse(decoded);

        __DEV__ && console.log("GATEWAY CODE: ", msg.o);

        switch(msg.o) {
            case GatewayEventCode.Hello: {
                __DEV__ && console.log("GATEWAY: HELLO", msg);

                this.heartbeat_interval = msg.p.heartbeat_interval || 45000;
                this.heartbeat_timer = setInterval(() => this.heartbeat(), this.heartbeat_interval) as any;

                this.identify();

                break;
            }
            case GatewayEventCode.HeartbeatACK: {
                __DEV__ && console.log("GATEWAY: ACK", msg);

                clearTimeout(this.heartbeat_timeout);
                break;
            }
            case GatewayEventCode.Ready: {
                __DEV__ && console.log("GATEWAY READY", msg);

                return postMsg({
                    t: GatewayMessageDiscriminator.Ready,
                    p: msg.p,
                });
            }
            case GatewayEventCode.InvalidSession: {
                __DEV__ && console.log("GATEWAY INVALID SESSION");
                return postMsg({
                    t: GatewayMessageDiscriminator.InvalidSession,
                });
            }
            case GatewayEventCode.PresenceUpdate:
            case GatewayEventCode.TypingStart:
            case GatewayEventCode.MessageDelete:
            case GatewayEventCode.MessageCreate: return postMsg({
                t: GatewayMessageDiscriminator.Event,
                p: msg,
            });
            default: {
                __DEV__ && console.log("GATEWAY UNKNOWN", msg);
            }
        }
    }

    heartbeat() {
        this.send({ o: GatewayClientCommandDiscriminator.Heartbeat });

        // in `heartbeat_interval` milliseconds, check if an ACK has been received or disconnect/reconnect
        this.heartbeat_timeout = setTimeout(() => this.disconnect(), this.heartbeat_interval) as any;
    }

    disconnect() {
        if(this.ws) {
            __DEV__ && console.log("GATEWAY DISCONNECTING!");

            // NOTE: This should trigger `on_close`
            this.ws.close();
        }
    }

    identify() {
        __DEV__ && console.log("Identifying with intent: ", this.intent.toString(2));

        this.send({ o: GatewayClientCommandDiscriminator.Identify, p: { auth: this.auth!, intent: this.intent } });
    }

    set_presence(away: boolean) {
        this.send({
            o: GatewayClientCommandDiscriminator.SetPresence, p: {
                flags: (away ? 2 : 1) | (IS_MOBILE ? 8 : 0),
            }
        });
    }
}

var GATEWAY: Gateway = new Gateway();

postMsg({ t: GatewayMessageDiscriminator.Initialized });

ctx.addEventListener('message', msg => {
    let data: GatewayCommand = msg.data;
    if(typeof data === 'string') {
        data = JSON.parse(data);
    }

    switch(data.t) {
        case GatewayCommandDiscriminator.Connect: {
            GATEWAY.auth = data.auth;
            GATEWAY.intent = data.intent;
            GATEWAY.connect();
            break;
        }
        case GatewayCommandDiscriminator.Disconnect: {
            GATEWAY.auth = null;
            GATEWAY.disconnect();
            break;
        }
        case GatewayCommandDiscriminator.SetPresence: {
            GATEWAY.set_presence(data.away);
            break;
        }
        default: {
            console.error("Unknown command: ", data);
        }
    }
});
