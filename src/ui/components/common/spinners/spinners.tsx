import React from "react";

import "../../../styles/root.scss";
import "../../../styles/layout.scss";
import "./spinners.scss";

interface SpinnerProps {
    size?: number,
}

function makeSpinnerStyle(props: SpinnerProps): React.CSSProperties {
    let size = props.size || 80;
    return { width: size, height: size };
}

export const Ripple = React.memo((props: SpinnerProps) => (
    <div className="ln-ripple ln-primary-text-color" style={makeSpinnerStyle(props)}>
        <div />
        <div />
    </div>
));