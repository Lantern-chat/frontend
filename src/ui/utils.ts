export function px(value: string | number | undefined): string | undefined {
    if(typeof value === "number") {
        value = value + "px";
    }
    return value;
}

export function br(value: number | boolean | undefined, digits: number = 1): undefined | string {
    return value ? ((+value * 50).toFixed(digits) + "%") : "0%";
}

import type { JSX } from "solid-js";

// This list is incomplete, see https://developer.mozilla.org/en-US/docs/Web/CSS/Reference for full list
const DIMENSIONAL: Set<keyof JSX.CSSProperties> = /*#__PURE__*/ new Set([
    "border-left-width",
    "border-right-width",
    "border-top-width",
    "border-bottom-width",
    "border-width",
    "border-top-left-radius",
    "border-top-right-radius",
    "border-bottom-left-radius",
    "border-bottom-right-radius",
    "border-radius",
    "font-size",
    "letter-spacing",
    "line-height",
    "margin",
    "margin-left",
    "margin-right",
    "margin-top",
    "margin-bottom",
    "margin-inline-end",
    "margin-inline-start",
    "margin-block-end",
    "margin-block-start",
    "padding-inline-end",
    "padding-inline-start",
    "padding-block-end",
    "padding-block-start",
    "padding",
    "padding-left",
    "padding-right",
    "padding-top",
    "padding-bottom",
    "top", "bottom", "left", "right",
    "width", "height",
    "max-width",
    "max-height",
    "min-width",
    "min-height",
    "text-indent",
    "tab-size",
    "outline-width",
]);

/**
 * Modifies style to change numeric values to pixels for fields with pixel values.
 *
 * @param style
 * @returns
 */
export function pxs(style?: JSX.CSSProperties | undefined): JSX.CSSProperties | undefined {
    if(style) {
        for(const key in style) {
            if(DIMENSIONAL.has(key as keyof JSX.CSSProperties)) {
                style[key as any] = px(style[key as keyof JSX.CSSProperties]);
            }
        }
    }
    return style;
}

/*
const enum Res {
    PENDING,
    SUCCESS,
    ERROR,
}

// TODO: Improve?
export function wrapPromise<T>(promise: Promise<T>) {
    let status = Res.PENDING;
    let result: any;
    let suspender = promise.then(
        r => {
            status = Res.SUCCESS;
            result = r;
        },
        e => {
            status = Res.ERROR;
            result = e;
        }
    );
    return {
        read(): T {
            switch(status) {
                case Res.PENDING: throw suspender;
                case Res.ERROR: throw result;
                case Res.SUCCESS: return result;
            }
        }
    };
}
*/

export function isDescendant(parent: HTMLElement, child: HTMLElement): boolean {
    let node = child.parentNode;
    while(node != null) {
        if(node == parent) {
            return true;
        }
        node = node.parentNode;
    }
    return false;
}

export let visibilityChange: string | null;
let hidden: string | null;
if(typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support
    hidden = "hidden";
    visibilityChange = "visibilitychange";
} else if(typeof (document as unknown as any).msHidden !== "undefined") {
    hidden = "msHidden";
    visibilityChange = "msvisibilitychange";
} else if(typeof (document as unknown as any).webkitHidden !== "undefined") {
    hidden = "webkitHidden";
    visibilityChange = "webkitvisibilitychange";
} else {
    console.log("Page visibility API is not available!");
}

export function isPageHidden(): boolean {
    return hidden != null && (document as any)[hidden];
}

