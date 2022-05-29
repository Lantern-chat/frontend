import { SpinnerProps, makeSpinnerStyle } from "./common";

import "./ripple.scss";
export function Ripple(props: SpinnerProps) {
    return (
        <div class="ln-ripple" style={makeSpinnerStyle(props)}>
            <div />
            <div />
        </div>
    );
}