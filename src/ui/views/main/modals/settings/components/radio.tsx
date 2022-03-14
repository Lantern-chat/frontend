import { For, JSX } from "solid-js";

export type IRadioOption = [string, JSX.Element];

export interface IRadioProps {
    options: Array<IRadioOption>,
    name: string,
    selected: string,
    onChange: (label: string) => void,
}

import "./radio.scss";
export function RadioSelect(props: IRadioProps) {
    let onChange = (e: Event) => props.onChange((e.currentTarget as HTMLInputElement).value);

    return (
        <div className="ln-settings-radio">
            <For each={props.options}>
                {([value, label]) => (
                    <div>
                        <input type="radio"
                            name={props.name} id={props.name + value} value={value}
                            checked={props.selected == value}
                            onChange={onChange} />

                        <label htmlFor={props.name + value}>{label}</label>
                    </div>
                )}
            </For>
        </div>
    );
}