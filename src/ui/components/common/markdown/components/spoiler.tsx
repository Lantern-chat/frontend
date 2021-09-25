import React, { useState } from "react";

import "./spoiler.scss";
export const Spoiler = React.memo(({ children }: { children: React.ReactNode }) => {
    let [visible, setVisible] = useState(false);

    return (
        <span onClick={() => setVisible(true)} className={"spoiler" + (visible ? ' visible' : '')}>
            {children}
        </span>
    )
});

if(__DEV__) {
    Spoiler.displayName = "Spoiler";
}