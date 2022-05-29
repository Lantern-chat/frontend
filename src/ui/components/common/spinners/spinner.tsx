import { SpinnerProps, makeSpinnerStyle } from "./common";

import "./spinner.scss";
export function Spinner(props: SpinnerProps) {
    return (
        <div class="ln-spinner" style={makeSpinnerStyle(props)}>
            <div />
            <div />
            <div />
            <div />
            <div />
            <div />
            <div />
            <div />
            <div />
            <div />
            <div />
            <div />
        </div >
    );
}