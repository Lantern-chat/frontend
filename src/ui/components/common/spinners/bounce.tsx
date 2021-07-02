import React from "react";

import { SpinnerProps, makeSpinnerStyle } from "./common";

import "./bounce.scss";
export const Bounce: React.FunctionComponent<SpinnerProps> = React.memo((props: SpinnerProps) => (
    <div className="ln-bounce" style={makeSpinnerStyle(props)}>
        <div />
        <div />
        <div />
    </div>
));

if(__DEV__) {
    Bounce.displayName = "BounceSpinner";
}