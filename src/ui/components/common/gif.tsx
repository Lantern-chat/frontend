import React, { useEffect, useLayoutEffect, useRef } from "react";

import Freezeframe from "freezeframe";
import { IS_MOBILE } from "lib/user_agent";
import { useSelector } from "react-redux";
import { UserPreferenceFlags } from "state/models";
import { selectPrefsFlag } from "state/selectors/prefs";

export type IAnimatedGifProps = React.ImgHTMLAttributes<HTMLImageElement>;

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
        do_freeze ? <div><img {...props} ref={img} /></div> : <img {...props} />
    );
});