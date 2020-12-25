import React from "react";

import "./spinners.scss";

interface SpinnerProps {
    size?: number,
}

function makeSpinnerStyle(props: SpinnerProps): React.CSSProperties {
    let size = props.size || 80;
    return { width: size, height: size };
}

export const Ripple = React.memo((props: SpinnerProps) => (
    <div className="ln-ripple" style={makeSpinnerStyle(props)}><div></div><div></div></div>
));