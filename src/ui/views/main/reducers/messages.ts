import dayjs, { Dayjs } from "dayjs";

export interface IMessage {
    id: number,
    ts: Dayjs,
    msg: string,
}

export interface IMessageStore {
    messages: IMessage[]
}

const DEFAULT_STATE: IMessageStore = {
    messages: []
};

export interface MessageAction {
    type: string,
    value: string,
}

let counter = 0;

export function messageReducer(state = DEFAULT_STATE, action: MessageAction): IMessageStore {
    switch(action.type) {
        case 'send': {
            counter += 1;
            return {
                messages: [...state.messages, {
                    id: counter,
                    msg: action.value,
                    ts: dayjs(),
                }]
            };
        }
        default: return state;
    }
}