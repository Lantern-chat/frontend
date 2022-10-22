import { JSX } from "solid-js";

declare module "solid-js" {
    namespace JSX {
        interface Directives {
            cleanedEvent: Array<[event: string, listener: (e: Event) => void]>;
        }
    }
}

type ExtractEventHandlers<T> =
    T extends `on:${string}`
    ? never
    : T extends `on${infer I}`
    ? Lowercase<I>
    : never;

type MapEventHandlers<T> = {
    [K in ExtractEventHandlers<keyof T> as `on:${K}` | `oncapture:${K}`]?: T[Extract<`on${K}`, keyof T>];
};

declare module "solid-js" {
    namespace JSX {
        // @ts-ignore made sure it's not recursive
        interface CustomAttributes<T>
            extends MapEventHandlers<JSX.DOMAttributes<T>> { }
    }
}