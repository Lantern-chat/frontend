import { SpinnerProps, makeSpinnerStyle } from "./common";

import "./ripple.scss";
export function Ripple(props: SpinnerProps) {
    return (
        <div className="ln-ripple" style={makeSpinnerStyle(props)}>
            <div />
            <div />
        </div>
    );
}