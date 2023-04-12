import { createEffect, JSX, onCleanup, onMount, Show, splitProps } from "solid-js"

import Freezeframe from "freezeframe";
import { IS_MOBILE } from "lib/user_agent";
import { usePrefs } from "state/contexts/prefs";

export interface IAnimatedGifProps extends JSX.ImgHTMLAttributes<HTMLImageElement> {
    which: "gif" | "apng" | "webp" | "avif",
    ref: (el: HTMLImageElement) => void,
}

import "./gif.scss";
export function AnimatedGif(props: IAnimatedGifProps) {
    let [, img_props] = splitProps(props, ["which", "ref"]);

    let img: HTMLImageElement | undefined,
        ref = (r: HTMLImageElement) => (img = r, props.ref?.(img)),
        do_freeze = usePrefs().UnfocusPause,
        freeze: Freezeframe;

    createEffect(() => {
        if(do_freeze()) {
            freeze = new Freezeframe(img, { responsive: false, overlay: IS_MOBILE });
            onCleanup(() => freeze.destroy());
        }
    });

    return (
        <Show when={do_freeze() && props.src} fallback={
            <img {...img_props} ref={ref} />}
        >
            <div class={"gif-wrapper ui-text " + props.which}>
                <img {...img_props} ref={ref} />
            </div>
        </Show>
    );
}