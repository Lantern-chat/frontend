import { onCleanup, createRenderEffect } from "solid-js";

var BLUR_LEVEL = 0;

export function createRootBlur(props: { blur?: boolean }) {
    createRenderEffect(() => {
        if(props.blur) {
            document.documentElement.classList.toggle('ln-root-blur', ++BLUR_LEVEL != 0);
            onCleanup(() => {
                document.documentElement.classList.toggle('ln-root-blur', --BLUR_LEVEL != 0);
            });
        }
    });
}