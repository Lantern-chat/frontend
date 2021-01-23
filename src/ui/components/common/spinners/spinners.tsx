import Preact from "preact/compat";

import "./spinners.scss";

interface SpinnerProps {
    size?: number,
}

function makeSpinnerStyle(props: SpinnerProps) {
    let size = props.size || 80;
    return { width: size, height: size };
}

export const Ripple: Preact.FunctionComponent<SpinnerProps> = Preact.memo((props: SpinnerProps) => (
    <div className="ln-ripple ln-primary-text-color" style={makeSpinnerStyle(props)}>
        <div />
        <div />
    </div>
));

if(process.env.NODE_ENV !== 'production') {
    Ripple.displayName = "RippleSpinner";
}