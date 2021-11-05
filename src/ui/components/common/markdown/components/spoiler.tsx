import React, { useState } from "react";

import "./spoiler.scss";
export const Spoiler = React.memo(({ children }: { children: React.ReactNode }) => {
    let [visible, setVisible] = useState(false), title;

    if(!visible) {
        title = "Click to reveal spoiler";
    }

    return (
        <span onClick={() => setVisible(true)} className={"spoiler " + (visible ? 'visible' : 'hidden')} title={title}>
            {children}
        </span>
    )
});

if(__DEV__) {
    Spoiler.displayName = "Spoiler";
}