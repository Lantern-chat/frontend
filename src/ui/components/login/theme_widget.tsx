import React, { useContext, useRef } from "react";

import { Theme, MIN_TEMP, MAX_TEMP } from "client/theme";

import { Glyphicon } from "ui/components/common/glyphicon";
import SunIcon from "icons/glyphicons-pro/glyphicons-basic-2-3/svg/individual-svg/glyphicons-basic-232-sun.svg";
import MoonIcon from "icons/glyphicons-pro/glyphicons-basic-2-3/svg/individual-svg/glyphicons-basic-231-moon.svg";

import "./theme_widget.scss";
export const ThemeWidget: React.FunctionComponent = () => {
    let input = useRef<HTMLInputElement | null>(null);
    let theme = useContext(Theme);

    let onTempTouchMove = (e: React.TouchEvent<HTMLInputElement>) => {
        if(input && input.current) {
            let { width, x } = input.current.getBoundingClientRect();
            let touch = e.touches[0].clientX - x;

            if(touch < 0 || touch > width) {
                return;
            }

            let t = touch / width;
            theme.setTheme({ ...theme, temperature: (1 - t) * MIN_TEMP + t * MAX_TEMP });
        }
    };

    return (
        <div className="ln-theme-widget" title="Change Theme">
            <div className="ln-theme-widget__icon" onClick={() => theme.setTheme({ ...theme, is_light: !theme.is_light })}>
                <Glyphicon src={theme.is_light ? MoonIcon : SunIcon} />
            </div>

            <div className="ln-theme-widget__options">
                <div className="ln-theme-widget__slider" title="Change Theme Temperature">
                    <input ref={input} type="range" min={MIN_TEMP} max={MAX_TEMP} value={theme.temperature} className="ln-slider" name="temperature"
                        onInput={e => theme.setTheme({ ...theme, temperature: parseFloat(e.currentTarget.value) })}
                        onTouchMove={onTempTouchMove} onTouchStart={onTempTouchMove} />
                </div>
            </div>
        </div>
    );
};