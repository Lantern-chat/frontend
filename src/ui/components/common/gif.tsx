import { createEffect, JSX, onCleanup, Show } from "solid-js"

import Freezeframe from "freezeframe";
import { IS_MOBILE } from "lib/user_agent";
import { UserPreferenceFlags } from "state/models";
import { selectPrefsFlag } from "state/selectors/prefs";
import { useRef } from "ui/hooks/useRef";
import { useRootSelector } from "state/root";

export interface IAnimatedGifProps {
    img: JSX.ImgHTMLAttributes<HTMLImageElement>,
    which: "gif" | "apng" | "webp" | "avif"
}

import "./gif.scss";
export function AnimatedGif(props: IAnimatedGifProps) {
    let img = useRef<HTMLImageElement>(),
        freeze: Freezeframe,
        do_freeze = useRootSelector(selectPrefsFlag(UserPreferenceFlags.UnfocusPause));

    createEffect(() => {
        let i = img.current;

        if(do_freeze() && i) {
            freeze = new Freezeframe(i, { responsive: false, overlay: IS_MOBILE });

            onCleanup(() => freeze.destroy());
        }
    });

    return (
        <Show when={do_freeze()} fallback={<img {...props.img} />}>
            <div className={"gif-wrapper ui-text " + props.which}><img {...props.img} ref={img} /></div>
        </Show>
    );
}