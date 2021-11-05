import React from "react";

export interface ISizeSliderProps {
    steps: number[],
    value: number,
    min?: number,
    max?: number,
    step?: number,
    label: React.ReactNode,
    htmlFor: string,

    onInput: (value: number) => void,
}

const B_ACTIVE = "#6666FF";
const B_INACTIVE = "rgba(128, 128, 128, 0.4)";

import "./size-slider.scss";
export const SizeSlider = React.memo((props: ISizeSliderProps) => {
    let onInput = (e: React.FormEvent<HTMLInputElement>) => {
        props.onInput(parseFloat(e.currentTarget.value));
    };

    let min = props.min ?? props.steps[0],
        max = props.max ?? props.steps[props.steps.length - 1],
        vp = (props.value - min) / (max - min) * 100,
        background = `linear-gradient(to right, ${B_ACTIVE} 0% ${vp}%, ${B_INACTIVE} ${vp}% 100%)`

    return (
        <div className="ln-settings-size-slider">
            <label htmlFor={props.htmlFor}>{props.label}</label>
            <div>
                <div className="ln-settings-size-slider__input" style={{ background }}>
                    <input type="range" name={props.htmlFor} min={min} max={max} step={props.step} value={props.value} onInput={onInput}></input>
                </div>

                <div className="ln-settings-size-slider__steps">
                    {
                        props.steps.map((step, i) => {
                            let style;
                            if(i > 0) {
                                style = { left: `calc(${(step - min) / (max - min) * 100}% - 1.5em)` };
                            }

                            return (
                                <span key={i} style={style}>{step}px</span>
                            )
                        })
                    }
                </div>
            </div>
        </div>
    )
})