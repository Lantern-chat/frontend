const ctx: Worker = self as any;

import { Message, MessageOp, IConnect, ISendMessage } from "./client/worker";
import * as pako from "pako";

interface Stream {
    socket: WebSocket,
    connect: IConnect,
}

class StreamManager {
    streams: Stream[] = [];

    connect(msg: Message<MessageOp.Connect>) {
        let connect = msg.data;

        let host = connect.host;
        host += '?encoding=json&compress=' + connect.compress;

        let socket = new WebSocket(host);
        socket.binaryType = 'arraybuffer';

        socket.onopen = (_ev) => {
            ctx.postMessage({ msg: 'ws_open', from: connect });
        }

        socket.onmessage = (ev) => {
            let data = ev.data;

            if(typeof data !== 'string') {
                if(connect.compress) {
                    data = pako.inflate(data, { to: 'string' });
                } else {
                    let decoder = new TextDecoder();
                    data = decoder.decode(data);
                }
            }

            ctx.postMessage({ msg: 'ws_message', from: connect, data: JSON.parse(data) });
        };

        socket.onerror = (ev) => {
            ctx.postMessage({ msg: 'ws_error', from: connect, data: ev.toString() });
        };

        socket.onclose = (_ev) => {
            ctx.postMessage({ msg: 'ws_close', from: connect });

            this.streams.splice(
                this.streams.findIndex((value) => value.connect.host == connect.host)
            );
        }

        this.streams.push({ socket, connect });
    }

    sendMessage(send_message: Message<MessageOp.SendMessage>) {
        let ws = this.streams.find((value) => value.connect.name == send_message.data.to);

        if(ws) {
            let msg: string | Uint8Array = send_message.data.msg;

            // convert to string first
            if(typeof msg === 'object') {
                msg = JSON.stringify(msg);
            }

            // convert string to array buffer
            if(typeof msg === 'string') {
                let encoder = new TextEncoder();
                msg = encoder.encode(msg);
            }

            // compress and send as binary
            ws.socket.send(ws.connect.compress ? pako.deflate(msg) : msg);
        }
    }
}

const MANAGER = new StreamManager();

ctx.addEventListener('message', (ev) => {
    let msg = ev.data as Message<any>;

    switch(msg.op) {
        case MessageOp.Connect: { return MANAGER.connect(msg); }
        case MessageOp.SendMessage: { return MANAGER.sendMessage(msg) }
    }
});