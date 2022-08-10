const ctx: Worker = self as any;

import { GatewaySocket, GatewayError } from "client-sdk/src/gateway";
import { ServerMsg, ClientMsg, ServerMsgOpcode, ClientMsgOpcode } from "client-sdk/src/models/gateway";
import { UserPresenceFlags } from "client-sdk/src/models";

import { GatewayMessage, GatewayMessageDiscriminator } from "./msg";
import { GatewayCommand, GatewayCommandDiscriminator } from "./cmd";

__DEV__ && console.log("!!!!!GATEWAY LOADED!!!!!");

function postMsg(msg: GatewayMessage) {
    ctx.postMessage(msg);
}

class Gateway {
    ws: GatewaySocket;

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
        let ws = this.ws = new GatewaySocket();

        ws.on('error', err => this.on_error(err));
        ws.on('msg', msg => this.on_msg(msg));
        ws.on('open', () => this.on_open());
        ws.on('close', ev => this.on_close(ev));
    }

    connect() {
        if(this.ws.readyState === 1) return;

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

    do_connect() {
        postMsg({ t: GatewayMessageDiscriminator.Connecting });

        let protocol = 'wss:';

        if(__DEV__ && self.location.protocol.startsWith('http')) {
            protocol = self.location.protocol.replace('http', 'ws');
        }

        this.ws.connect(`${protocol}//${self.location.host}/api/v1/gateway?compress=true&encoding=json`);
    }

    retry_now() {
        clearTimeout(this.connecting_timeout);
        this.connecting_timeout = undefined;
        this.do_connect();
    }

    // TODO: Memoize?
    send(value: ClientMsg) {
        this.ws.send(value);
    }

    do_close() {
        clearTimeout(this.heartbeat_timeout);
        clearInterval(this.heartbeat_timer);
    }

    on_close(msg: CloseEvent) {
        __DEV__ && console.log("GATEWAY CLOSED");

        this.do_close();
        postMsg({ t: GatewayMessageDiscriminator.Disconnected, p: msg.code });
    }

    on_error(_err: GatewayError) {
        __DEV__ && console.log("GATEWAY ERROR: ", _err);

        this.do_close();
        postMsg({ t: GatewayMessageDiscriminator.Error, p: { err: "WS Error" } });
    }

    on_open() {
        this.attempt = 0;

        postMsg({ t: GatewayMessageDiscriminator.Connected });
        // NOTE: Nothing else to do on open except wait for the Hello event
    }

    on_msg(msg: ServerMsg) {
        __DEV__ && console.log("GATEWAY MSG: ", msg);

        switch(msg.o) {
            case ServerMsgOpcode.Hello: {
                __DEV__ && console.log("GATEWAY: HELLO", msg);

                this.heartbeat_interval = msg.p.heartbeat_interval || 45000;
                this.heartbeat_timer = setInterval(() => this.heartbeat(), this.heartbeat_interval) as any;

                this.identify();

                break;
            }
            case ServerMsgOpcode.HeartbeatAck: {
                __DEV__ && console.log("GATEWAY: ACK", msg);

                clearTimeout(this.heartbeat_timeout);
                break;
            }
            case ServerMsgOpcode.Ready: {
                __DEV__ && console.log("GATEWAY READY", msg);

                return postMsg({
                    t: GatewayMessageDiscriminator.Ready,
                    p: msg.p,
                });
            }
            case ServerMsgOpcode.InvalidSession: {
                __DEV__ && console.log("GATEWAY INVALID SESSION");
                return postMsg({
                    t: GatewayMessageDiscriminator.InvalidSession,
                });
            }
            default: return postMsg({
                t: GatewayMessageDiscriminator.Event,
                p: msg,
            });
        }
    }

    heartbeat() {
        this.send({ o: ClientMsgOpcode.Heartbeat });

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

        this.send({ o: ClientMsgOpcode.Identify, p: { auth: this.auth!, intent: this.intent } });
    }

    set_presence(away: boolean, mobile: boolean) {
        this.send({
            o: ClientMsgOpcode.SetPresence, p: {
                flags: away
                    ? UserPresenceFlags.Away
                    : ((mobile ? UserPresenceFlags.Mobile : 0) | UserPresenceFlags.Online),
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
            GATEWAY.intent = data.intent || 0;
            GATEWAY.connect();
            break;
        }
        case GatewayCommandDiscriminator.Disconnect: {
            GATEWAY.auth = null;
            GATEWAY.disconnect();
            break;
        }
        case GatewayCommandDiscriminator.SetPresence: {
            GATEWAY.set_presence(data.away, data.mobile);
            break;
        }
        default: {
            console.error("Unknown command: ", data);
        }
    }
});
