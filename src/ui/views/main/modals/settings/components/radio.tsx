import { createSelector, For, JSX } from "solid-js";

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

    let is_selected = createSelector(() => props.selected);

    return (
        <div class="ln-settings-radio">
            <For each={props.options}>
                {([value, label]) => (
                    <div>
                        <input type="radio"
                            name={props.name} id={props.name + value} value={value}
                            checked={is_selected(value)}
                            onChange={onChange} />

                        <label for={props.name + value}>{label}</label>
                    </div>
                )}
            </For>
        </div>
    );
}