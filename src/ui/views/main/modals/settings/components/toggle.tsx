import { createSignal, JSX } from "solid-js";
import { useSelector, useDispatch } from "solid-mutant";

import { savePrefsFlag } from "state/commands/prefs";
import { UserPreferenceFlags } from "state/models";
import { selectPrefsFlag } from "state/selectors/prefs";

import "./toggle.scss";

export interface IToggleProps {
    htmlFor: string,
    label: JSX.Element,
    checked?: boolean,
    onChange: (checked: boolean) => void,
}

export function Toggle(props: IToggleProps) {
    let [checked, setChecked] = createSignal<boolean>(!!props.checked),
        onChange = (e: Event) => {
            let checked = (e.currentTarget as HTMLInputElement).checked;

            setChecked(checked);
            props.onChange(checked);
        };

    return (
        <div className="ln-settings-toggle">
            <label htmlFor={props.htmlFor}>{props.label}</label>
            <span className="spacer" />
            <input type="checkbox" name={props.htmlFor} id={props.htmlFor} checked={checked()} onChange={onChange} />
        </div>
    );
}

export interface ITogglePrefsFlagProps {
    htmlFor: string,
    label: JSX.Element,
    flag: UserPreferenceFlags,
}

export function TogglePrefsFlag(props: ITogglePrefsFlagProps) {
    let current_flag = useSelector(selectPrefsFlag(props.flag)),
        dispatch = useDispatch(),
        onChange = (checked: boolean) => {
            dispatch(savePrefsFlag(props.flag, checked));
        };

    return (
        <Toggle htmlFor={props.htmlFor} label={props.label} checked={current_flag()} onChange={onChange} />
    );
}