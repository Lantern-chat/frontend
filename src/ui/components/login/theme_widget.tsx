import React, { useContext, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { themeSelector } from "state/selectors/theme";
import { setTheme } from "state/commands/theme";

import { MIN_TEMP, MAX_TEMP } from "lib/theme";

import { Glyphicon } from "ui/components/common/glyphicon";
import SunIcon from "icons/glyphicons-pro/glyphicons-basic-2-4/svg/individual-svg/glyphicons-basic-232-sun.svg";
import MoonIcon from "icons/glyphicons-pro/glyphicons-basic-2-4/svg/individual-svg/glyphicons-basic-231-moon.svg";

import throttle from 'lodash/throttle';

import "./theme_widget.scss";
export const ThemeWidget: React.FunctionComponent = React.memo(() => {
    let input = useRef<HTMLInputElement>(null);
    let theme = useSelector(themeSelector);
    let dispatch = useDispatch();

    let [interactive, setInteractive] = useState(theme);

    let doSetTheme = (temperature: number, is_light: boolean) => {
        setInteractive({ temperature, is_light, oled: theme.oled });
        dispatch(setTheme(temperature, is_light, theme.oled));
    };

    let onTempTouchMove = throttle((e: React.TouchEvent<HTMLInputElement>) => {
        if(input.current) {
            let { width, x } = input.current.getBoundingClientRect();
            let touch = e.touches[0].clientX - x;

            if(touch < 0 || touch > width) {
                return;
            }

            let t = touch / width, temperature = (1 - t) * MIN_TEMP + t * MAX_TEMP;

            doSetTheme(temperature, interactive.is_light);
        }
    }, 50, { trailing: true });

    return (
        <div className="ln-theme-widget" title="Change Theme">
            <div className="ln-theme-widget__icon" onClick={() => doSetTheme(interactive.temperature, !interactive.is_light)}>
                <Glyphicon src={interactive.is_light ? MoonIcon : SunIcon} />
            </div>

            <div className="ln-theme-widget__options">
                <div className="ln-theme-widget__slider" title="Change Theme Temperature">
                    <input ref={input} type="range" className="ln-slider" name="temperature"
                        min={MIN_TEMP} max={MAX_TEMP}
                        value={interactive.temperature}
                        onInput={e => doSetTheme(parseFloat(e.currentTarget.value), interactive.is_light)}
                        onTouchMove={onTempTouchMove} onTouchStart={onTempTouchMove} />
                </div>
            </div>
        </div>
    );
});
if(__DEV__) {
    ThemeWidget.displayName = "Theme Widget";
}