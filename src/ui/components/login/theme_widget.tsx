import React, { useContext, useState } from "react";

import { Theme, MIN_TEMP, MAX_TEMP } from "client/theme";

import { Glyphicon } from "ui/components/common/glyphicon";
import SunIcon from "icons/glyphicons-pro/glyphicons-basic-2-3/svg/individual-svg/glyphicons-basic-232-sun.svg";
import MoonIcon from "icons/glyphicons-pro/glyphicons-basic-2-3/svg/individual-svg/glyphicons-basic-231-moon.svg";

import "./theme_widget.scss";
export const ThemeWidget: React.FunctionComponent = () => {
    let theme = useContext(Theme);

    return (
        <div className="ln-theme-widget-wrapper">
            <div className="ln-theme-widget">
                <div className="ln-theme-widget-icon" onClick={() => theme.setTheme({ ...theme, is_light: !theme.is_light })}>
                    <Glyphicon src={theme.is_light ? MoonIcon : SunIcon} />
                </div>

                <div className="ln-theme-widget-options">
                    <div className="ln-theme-widget-slider">
                        <input type="range" min={MIN_TEMP} max={MAX_TEMP} value={theme.temperature} className="slider" name="temperature"
                            onInput={e => theme.setTheme({ ...theme, temperature: parseFloat(e.currentTarget.value) })} />
                    </div>
                </div>
            </div>
        </div>
    );
};