import { createMemo, JSX } from "solid-js";
import { px } from "ui/utils";

export interface ISizeSliderProps {
    steps: number[],
    value: number,
    min?: number,
    max?: number,
    step?: number,
    label: JSX.Element,
    htmlFor: string,

    onInput: (value: number) => void,
}

const B_ACTIVE = "#6666FF";
const B_INACTIVE = "rgba(128, 128, 128, 0.4)";

import "./size-slider.scss";
export function SizeSlider(props: ISizeSliderProps) {
    let onInput = (e: InputEvent) => {
        props.onInput(parseFloat((e.currentTarget as HTMLInputElement).value));
    };

    let bounds = createMemo(() => {
        let min = props.min ?? props.steps[0],
            max = props.max ?? props.steps[props.steps.length - 1];

        return { min, max };
    });

    let background = createMemo(() => {
        let { min, max } = bounds(),
            vp = (props.value - min) / (max - min) * 100;

        return `linear-gradient(to right, ${B_ACTIVE} 0% ${vp}%, ${B_INACTIVE} ${vp}% 100%)`;
    });

    let steps = createMemo(() => {
        let { min, max } = bounds();

        return props.steps.map((step, i) => {
            let style;
            if(i > 0) { style = { left: `calc(${(step - min) / (max - min) * 100}% - 1.5em)` }; }

            return (<span style={style} textContent={px(step)} />);
        });
    });

    return (
        <div className="ln-settings-size-slider">
            <label htmlFor={props.htmlFor}>{props.label}</label>
            <div>
                <div className="ln-settings-size-slider__input" style={{ background: background() }}>
                    <input type="range" name={props.htmlFor} min={bounds().min} max={bounds().max}
                        step={props.step} value={props.value} onInput={onInput} />
                </div>

                <div className="ln-settings-size-slider__steps">
                    {steps()}
                </div>
            </div>
        </div>
    );
}