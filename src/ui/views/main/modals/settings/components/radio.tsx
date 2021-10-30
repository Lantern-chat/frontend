import React, { useCallback, useState } from "react";

export type IRadioOption = [string, React.ReactNode];

export interface IRadioProps {
    options: IRadioOption[],
    name: string,
    selected: string,
    onChange: (label: string) => void,
}

import "./radio.scss";
export const RadioSelect = React.memo((props: IRadioProps) => {
    let name = props.name,
        onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
            props.onChange(e.currentTarget.value);
        }, [props.onChange]);

    return (
        <div className="ln-settings-radio">
            {props.options.map(([value, label], i) => (
                <div key={value}>
                    <input type="radio" name={name} id={name + value} value={value}
                        checked={props.selected == value}
                        onChange={onChange} />
                    <label htmlFor={name + value}>{label}</label>
                </div>
            ))}
        </div>
    )
});