declare var __DEV__: boolean;
declare var __PRERELEASE__: boolean;
declare var __TEST__: boolean;
declare var __VERSION__: string;

interface HTMLMediaElement {
    playing: boolean;
}

declare type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

//declare type DeepReadonly<T> = T extends {} ? { readonly [K in keyof T]: DeepReadonly<T[K]> } : T;

declare type ObjectFromList<T extends ReadonlyArray<string>, V = string> = {
    [K in (T extends ReadonlyArray<infer U> ? U : never)]: V
};

declare type TypedEvent<H extends HTMLElement, T extends Event> = T & { target: H };

// declare type DeepReadonly<T> = 0 extends 1 & T ? T : T extends import("solid-js/store").NotWrappable ? T : {
//     readonly [K in keyof T]: DeepReadonly<T[K]>;
// };

declare type SnakeToCamelCase<S extends string> =
    S extends `${infer T}_${infer U}_${infer V}` ?
    `${T}${Capitalize<U>}${Capitalize<SnakeToCamelCase<V>>}` :
    S extends `${infer T}_${infer U}` ?
    `${T}${Capitalize<SnakeToCamelCase<U>>}` :
    S;

declare type ToPascalCase<S extends string> = Capitalize<SnakeToCamelCase<S>>;