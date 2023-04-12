import type { JSX } from "solid-js";

import { px } from "ui/utils";

export interface SpinnerProps {
    size?: number | string,
}

export function makeSpinnerStyle(props: SpinnerProps): JSX.CSSProperties {
    let size = props.size || 80;
    if(typeof size === "string" && size.includes("em")) {
        return { width: "1em", height: "1em", "font-size": size };
    }
    return { width: px(size), height: px(size) };
}