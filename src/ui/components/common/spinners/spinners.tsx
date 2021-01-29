import React from "react";

import "./spinners.scss";

interface SpinnerProps {
    size?: number,
}

function makeSpinnerStyle(props: SpinnerProps) {
    let size = props.size || 80;
    return { width: size, height: size };
}

export const Ripple: React.FunctionComponent<SpinnerProps> = React.memo((props: SpinnerProps) => (
    <div className="ln-ripple ln-primary-text-color" style={makeSpinnerStyle(props)}>
        <div />
        <div />
    </div>
));

if(process.env.NODE_ENV !== 'production') {
    Ripple.displayName = "RippleSpinner";
}