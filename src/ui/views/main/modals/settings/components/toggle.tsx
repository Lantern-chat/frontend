import { createRenderEffect, createSignal, JSX } from "solid-js";

import { savePrefsFlag } from "state/commands/prefs";
import { UserPreferenceFlags } from "state/models";
import { useRootDispatch, useRootSelector } from "state/root";
import { selectPrefsFlag } from "state/selectors/prefs";

import "./toggle.scss";

export interface IToggleProps {
    htmlFor: string,
    label: JSX.Element,
    checked?: boolean,
    onChange: (checked: boolean) => void,
    disabled?: boolean,
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
        <div className="ln-settings-toggle">
            <label htmlFor={props.htmlFor}>{props.label}</label>
            <span className="spacer" />
            <input type="checkbox" name={props.htmlFor} id={props.htmlFor}
                checked={checked() && !props.disabled} onChange={onChange} disabled={props.disabled} />
        </div>
    );
}

export interface ITogglePrefsFlagProps {
    htmlFor: string,
    label: JSX.Element,
    flag: UserPreferenceFlags,
}

export function TogglePrefsFlag(props: ITogglePrefsFlagProps) {
    let current_flag = useRootSelector(selectPrefsFlag(props.flag)),
        dispatch = useRootDispatch(),
        onChange = (checked: boolean) => {
            dispatch(savePrefsFlag(props.flag, checked));
        };

    return (
        <Toggle htmlFor={props.htmlFor} label={props.label} checked={current_flag()} onChange={onChange} />
    );
}