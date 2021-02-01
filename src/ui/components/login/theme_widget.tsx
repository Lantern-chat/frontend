import React, { useContext, useEffect, useState, useRef } from "react";

import { Theme, MIN_TEMP, MAX_TEMP, setTheme } from "client/theme";

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
        <div className="ln-theme-widget-wrapper">
            <div className="ln-theme-widget">
                <div className="ln-theme-widget-icon" onClick={() => theme.setTheme({ ...theme, is_light: !theme.is_light })}
                >
                    <Glyphicon src={theme.is_light ? MoonIcon : SunIcon} />
                </div>

                <div className="ln-theme-widget-options">
                    <div className="ln-theme-widget-slider">
                        <input ref={input} type="range" min={MIN_TEMP} max={MAX_TEMP} value={theme.temperature} className="slider" name="temperature"
                            onInput={e => theme.setTheme({ ...theme, temperature: parseFloat(e.currentTarget.value) })}
                            onTouchMove={onTempTouchMove} onTouchStart={onTempTouchMove} />
                    </div>
                </div>
            </div>
        </div>
    );
};