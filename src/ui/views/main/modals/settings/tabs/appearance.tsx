import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import throttle from "lodash/throttle";

import { setTheme } from "state/commands/theme";
import { savePrefs } from "state/commands/prefs";
import { themeSelector } from "state/selectors/theme";
import { RootState } from "state/root";

import { FormGroup, FormInput, FormLabel } from "ui/components/form";

import { MIN_TEMP, MAX_TEMP } from "lib/theme";

import "./appearance.scss";
export const AppearanceSettingsTab = () => {
    let dispatch = useDispatch();

    return (
        <form className="ln-form">
            <ThemeSetting onChange={(temp, light) => dispatch(savePrefs({ temp, light }))} />

        </form>
    );
};

interface IThemeSettingsProps {
    onChange: (temp: number, light: boolean) => void,
}

const ThemeSetting = React.memo(({ onChange }: IThemeSettingsProps) => {
    let input = useRef<HTMLInputElement>(null),
        theme = useSelector(themeSelector),
        dispatch = useDispatch(),
        [interactive, setInteractive] = useState(theme),
        doSetTheme = (temperature: number, is_light: boolean) => {
            setInteractive({ temperature, is_light });
            dispatch(setTheme(temperature, is_light));
            onChange(temperature, is_light);
        };

    let onTempTouchMove = throttle((e: React.TouchEvent<HTMLInputElement>) => {
        if(input.current) {
            let { width, x } = input.current.getBoundingClientRect();
            let touch = e.touches[0].clientX - x;
            if(touch < 0 || touch > width) return;
            let t = touch / width, temperature = (1 - t) * MIN_TEMP + t * MAX_TEMP;
            doSetTheme(temperature, interactive.is_light);
        }
    }, 50, { trailing: true });

    return (
        <>
            <div>
                <label htmlFor="light_theme">Light Theme</label>
                <input type="checkbox" name="light_theme" checked={interactive.is_light}
                    onChange={(e => doSetTheme(interactive.temperature, e.currentTarget.checked))} />
            </div>

            <div>
                <label htmlFor="temperature">Temperature</label>
                <div className="ln-theme-temp-slider" title="Change Theme Temperature">
                    <input ref={input} type="range" className="ln-slider" name="temperature"
                        min={MIN_TEMP} max={MAX_TEMP} step="1"
                        value={interactive.temperature}
                        onInput={e => doSetTheme(parseFloat(e.currentTarget.value), interactive.is_light)}
                        onTouchMove={onTempTouchMove} onTouchStart={onTempTouchMove} />
                </div>
            </div>
        </>
    )
});