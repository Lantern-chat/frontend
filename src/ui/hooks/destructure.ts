import { Accessor, JSX } from "solid-js";

export interface Props {
    [key: string]: any
}

export type PropsToAccessors<P extends Props> = {
    [K in keyof P]: Accessor<P[K]>;
}

export function destructure<P>(component: (props: PropsToAccessors<P>) => JSX.Element): (props: P) => JSX.Element;
export function destructure<P>(props: P): PropsToAccessors<P>;
export function destructure(props: any) {
    if(typeof props === 'function') {
        return (p: any) => props(destructure(p));
    }
    return new Proxy(props, {
        get: (target, prop) => () => target[prop],
    });
}