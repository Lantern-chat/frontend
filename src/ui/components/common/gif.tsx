import React, { useEffect, useLayoutEffect, useRef } from "react";

import Freezeframe from "freezeframe";
import { IS_MOBILE } from "lib/user_agent";
import { useSelector } from "react-redux";
import { UserPreferenceFlags } from "state/models";
import { selectPrefsFlag } from "state/selectors/prefs";

export interface IAnimatedGifProps {
    img: React.ImgHTMLAttributes<HTMLImageElement>,
    which: "gif" | "apng" | "webp" | "avif"
}

import "./gif.scss";
export const AnimatedGif = React.memo((props: IAnimatedGifProps) => {
    let img = useRef<HTMLImageElement>(null),
        freeze = useRef<Freezeframe>(),
        do_freeze = useSelector(selectPrefsFlag(UserPreferenceFlags.UnfocusPause));

    useLayoutEffect(() => {
        let i = img.current;
        if(do_freeze && i) {
            freeze.current = new Freezeframe(i, { responsive: false, overlay: IS_MOBILE });
        } else if(freeze.current) {
            freeze.current.destroy();
            freeze.current = undefined;
        }
    }, [img.current, do_freeze]);

    return (
        // use wrapper div to force React to recreate the DOM nodes on unfreeze
        do_freeze ? <div className={"gif-wrapper ui-text " + props.which}><img {...props.img} ref={img} /></div> : <img {...props.img} />
    );
});

if(__DEV__) {
    AnimatedGif.displayName = "AnimatedGif";
}