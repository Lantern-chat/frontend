import React from "react";

import { SpinnerProps, makeSpinnerStyle } from "./common";

import "./spinner.scss";
export const Spinner: React.FunctionComponent<SpinnerProps> = React.memo((props: SpinnerProps) => (
    <div className="ln-spinner" style={makeSpinnerStyle(props)}>
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
));

if(process.env.NODE_ENV !== 'production') {
    Spinner.displayName = "SpinnerSpinner";
}