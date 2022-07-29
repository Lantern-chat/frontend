import { createEffect, createRenderEffect, JSX, onCleanup, Show, splitProps } from "solid-js"

import Freezeframe from "freezeframe";
import { IS_MOBILE } from "lib/user_agent";
import { usePrefs } from "state/contexts/prefs";
import { composeRefs, createRef, Ref } from "ui/hooks/createRef";


export interface IAnimatedGifProps extends JSX.ImgHTMLAttributes<HTMLImageElement> {
    which: "gif" | "apng" | "webp" | "avif",
    img: Ref<HTMLImageElement | undefined>,
}

import "./gif.scss";
export function AnimatedGif(props: IAnimatedGifProps) {
    let [local, img_props] = splitProps(props, ['which', 'img']);

    let img = composeRefs<HTMLImageElement>(local.img),
        freeze: Freezeframe,
        do_freeze = usePrefs().UnfocusPause;

    createEffect(() => {
        let i = img.current;

        if(i && do_freeze()) {
            freeze = new Freezeframe(i, { responsive: false, overlay: IS_MOBILE });

            onCleanup(() => freeze.destroy());
        }
    });

    return (
        <Show when={do_freeze() && props.src} fallback={<img {...img_props} ref={img} />}>
            <div class={"gif-wrapper ui-text " + local.which}>
                <img {...img_props} ref={img} />
            </div>
        </Show>
    );
}