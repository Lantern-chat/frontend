import { createEffect, createRenderEffect, JSX, onCleanup, Show } from "solid-js"

import Freezeframe from "freezeframe";
import { IS_MOBILE } from "lib/user_agent";
import { UserPreferenceFlags } from "state/models";
import { selectPrefsFlag } from "state/selectors/prefs";
import { createRef } from "ui/hooks/createRef";
import { useRootSelector } from "state/root";

export interface IAnimatedGifProps {
    img: JSX.ImgHTMLAttributes<HTMLImageElement>,
    which: "gif" | "apng" | "webp" | "avif"
}

import "./gif.scss";
export function AnimatedGif(props: IAnimatedGifProps) {
    let img = createRef<HTMLImageElement>(),
        freeze: Freezeframe,
        do_freeze = useRootSelector(selectPrefsFlag(UserPreferenceFlags.UnfocusPause));

    createRenderEffect(() => {
        let i = img.current;

        if(i && do_freeze()) {
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