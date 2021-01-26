import React, { useContext, useMemo } from "react";

import { CLIENT } from "index";

import { Theme } from "client/theme";

import { Glyphicon } from "ui/components/common/glyphicon";
import SunIcon from "icons/glyphicons-pro/glyphicons-basic-2-3/svg/individual-svg/glyphicons-basic-232-sun.svg";
import MoonIcon from "icons/glyphicons-pro/glyphicons-basic-2-3/svg/individual-svg/glyphicons-basic-231-moon.svg";

import "./theme_widget.scss";
export const ThemeWidget: React.FunctionComponent = () => {
    let theme = useContext(Theme);

    console.log(theme);

    let icon = theme.is_light ?
        <Glyphicon import={() => Promise.resolve({ default: MoonIcon })} /> :
        <Glyphicon import={() => Promise.resolve({ default: SunIcon })} />;

    return (
        <div className="ln-theme-widget-wrapper">
            <span>
                <button onClick={() => CLIENT.theme.is_light = !CLIENT.theme.is_light} style={{ display: 'block' }}>Test</button>
                {icon}
            </span>
        </div>
    );
};