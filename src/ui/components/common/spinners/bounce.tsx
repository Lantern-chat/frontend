import { SpinnerProps, makeSpinnerStyle } from "./common";

import "./bounce.scss";
export function Bounce(props: SpinnerProps) {
    return (
        <div class="ln-bounce" style={makeSpinnerStyle(props)}>
            <div />
            <div />
            <div />
        </div>
    );
}