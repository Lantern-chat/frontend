import React, { useCallback, useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import { savePrefsFlag } from "state/commands/prefs";
import { UserPreferenceFlags } from "state/models";
import { selectPrefsFlag } from "state/selectors/prefs";

import "./toggle.scss";

export interface IToggleProps {
    htmlFor: string,
    label: React.ReactNode,
    checked?: boolean,
    onChange: (checked: boolean) => void,
}

export const Toggle = React.memo((props: IToggleProps) => {
    let [checked, setChecked] = useState<boolean>(!!props.checked),
        onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
            let checked = e.currentTarget.checked;

            setChecked(checked);
            props.onChange(checked);
        }, [props.onChange]);

    return (
        <div className="ln-settings-toggle">
            <label htmlFor={props.htmlFor}>{props.label}</label>
            <span className="spacer" />
            <input type="checkbox" name={props.htmlFor} checked={checked} onChange={onChange} />
        </div>
    )
});

export interface ITogglePrefsFlagProps {
    htmlFor: string,
    label: React.ReactNode,
    flag: UserPreferenceFlags,
}

export const TogglePrefsFlag = React.memo((props: ITogglePrefsFlagProps) => {
    let current_flag = useSelector(selectPrefsFlag(props.flag)),
        dispatch = useDispatch(),
        onChange = useCallback((checked: boolean) => {
            dispatch(savePrefsFlag(props.flag, checked));
        }, [props.flag]);

    return (
        <Toggle htmlFor={props.htmlFor} label={props.label} checked={current_flag} onChange={onChange} />
    )
});