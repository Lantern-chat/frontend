import { createRenderEffect, createSignal, JSX, Show } from "solid-js";

import { savePrefsFlag } from "state/commands/prefs";
import { UserPreferenceFlags } from "state/models";
import { useRootDispatch, useRootSelector } from "state/root";
import { selectPrefsFlag } from "state/selectors/prefs";

import "./toggle.scss";

export interface IToggleProps {
    for: string,
    label: JSX.Element,
    checked?: boolean,
    onChange: (checked: boolean) => void,
    disabled?: boolean,
    subtext?: string,
}

export function Toggle(props: IToggleProps) {
    let [checked, setChecked] = createSignal<boolean>(!!props.checked),
        onChange = (e: Event) => {
            let checked = (e.currentTarget as HTMLInputElement).checked;

            setChecked(checked);
            props.onChange(checked);
        };

    // if props.checked changes (controlled), then update
    createRenderEffect(() => setChecked(!!props.checked));

    return (
        <div class="ln-settings-toggle">
            <label for={props.for} class="ui-text">
                {props.label}

                {/* zero-sized if empty */}
                <span class="ui-text subtext" textContent={props.subtext} />
            </label>
            <span class="spacer" />
            <input type="checkbox" name={props.for} id={props.for}
                checked={checked() && !props.disabled} onChange={onChange} disabled={props.disabled} />
        </div>
    );
}

export interface ITogglePrefsFlagProps {
    for: string,
    label: JSX.Element,
    flag: UserPreferenceFlags,
    subtext?: string,
}

export function TogglePrefsFlag(props: ITogglePrefsFlagProps) {
    let current_flag = useRootSelector(selectPrefsFlag(props.flag)),
        dispatch = useRootDispatch(),
        onChange = (checked: boolean) => {
            dispatch(savePrefsFlag(props.flag, checked));
        };

    return (
        <Toggle for={props.for} label={props.label} checked={current_flag()} onChange={onChange} subtext={props.subtext} />
    );
}