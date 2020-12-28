export type ISubscriber<This> = (this: This) => void;

/**
 * Dumb "Event Emitter" class that only triggers the event callbacks,
 * but does not deliver any data.
 */
export class TinyEventEmitter {
    subs: Record<string, ISubscriber<this>[]> = {};

    sub(event: string, subscriber: ISubscriber<this>) {
        let events = this.subs[event] ||= [];
        events.push(subscriber.bind(this));
    }

    unsub(event: string, subscriber: ISubscriber<this>) {
        let events = this.subs[event];
        if(events) {
            let idx = events.indexOf(subscriber);
            if(idx != -1) {
                events.splice(idx);
            }
        }
    }

    emit(event: string) {
        let events = this.subs[event];
        if(events) {
            for(let event of events) {
                (event as any)(); // was bound on sub, so just call
            }
        }
    }
}