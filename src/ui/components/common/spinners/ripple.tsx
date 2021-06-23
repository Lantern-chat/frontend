import React from "react";

import { SpinnerProps, makeSpinnerStyle } from "./common";

import "./ripple.scss";
export const Ripple: React.FunctionComponent<SpinnerProps> = React.memo((props: SpinnerProps) => (
    <div className="ln-ripple" style={makeSpinnerStyle(props)}>
        <div />
        <div />
    </div>
));

if(__DEV__) {
    Ripple.displayName = "RippleSpinner";
}