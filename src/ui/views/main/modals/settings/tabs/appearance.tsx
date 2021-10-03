import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import throttle from "lodash/throttle";

import { setTheme } from "state/commands/theme";
import { savePrefs } from "state/commands/prefs";
import { Font, UserPreferences } from "state/models";
import { themeSelector } from "state/selectors/theme";
import { RootState } from "state/root";

import { FormGroup, FormInput, FormLabel, FormSelect } from "ui/components/form";

import { MIN_TEMP, MAX_TEMP } from "lib/theme";

import "./appearance.scss";
export const AppearanceSettingsTab = () => {
    let dispatch = useDispatch();

    return (
        <form className="ln-settings-form">
            <ThemeSetting onChange={(temp, light) => dispatch(savePrefs({ temp, light }))} />

            <FontSelector which="chat" />

            <FontSelector which="ui" />
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
            <div className="ln-settings-theme">
                <label htmlFor="light_theme">Light Theme</label>
                <input type="checkbox" name="light_theme" checked={interactive.is_light}
                    onChange={(e => doSetTheme(interactive.temperature, e.currentTarget.checked))} />
            </div>

            <div className="ln-settings-temperature">
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

const Fonts = {
    'sansserif': 'Sans Serif',
    'serif': 'Serif',
    'monospace': 'Monospace',
    'cursive': 'Cursive',
    'opendyslexic': 'Open Dyslexic',
};

interface IFontSelectorProps {
    which: 'chat' | 'ui',
}

const FontSelector = React.memo(({ which }: IFontSelectorProps) => {
    let name, label, prefs_key = which == 'chat' ? 'chat_font' : 'ui_font';

    let dispatch = useDispatch();
    let current_font = useSelector((state: RootState) => state.prefs[prefs_key]);
    let [font, setFont] = useState(Font[current_font].toLowerCase());

    useEffect(() => {
        if(font == 'opendyslexic') {
            import("ui/fonts/opendyslexic");
        }
    }, [font]);

    if(which == 'chat') {
        name = "Chat Font";
        label = 'chat_font';
    } else {
        name = "UI Font";
        label = 'ui_font';
    }

    let font_class = "ln-font-" + font;

    let onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        let font_name: keyof typeof Fonts = e.currentTarget.value as any;
        if(!Fonts.hasOwnProperty(font_name)) return;

        setFont(font_name);

        let font = (() => {
            switch(font_name) {
                case 'serif': return Font.Serif;
                case 'cursive': return Font.Cursive;
                case 'monospace': return Font.Monospace;
                case 'opendyslexic': return Font.OpenDyslexic;
                case 'sansserif': return Font.SansSerif;
            }
        })();

        let prefs: Partial<UserPreferences> = {};
        prefs[prefs_key] = font;

        dispatch(savePrefs(prefs));
    };

    return (
        <>
            <div className="ln-settings-font">
                <label htmlFor={label}>{name}</label>
                <div className="ln-settings-font__wrapper">
                    <div className="ln-settings-font__selector">
                        <FormSelect name={label} value={font} onChange={onChange}>
                            {Object.keys(Fonts).map((font) => (
                                <option value={font} key={font}
                                    className={"ln-font-" + font}>
                                    {Fonts[font]}
                                </option>
                            ))}
                        </FormSelect>
                    </div>
                    <div className={"ln-settings-font__example " + font_class}>
                        The wizard quickly jinxed the gnomes before they vaporized.
                    </div>
                </div>
            </div>
        </>
    )
});

const FontScale = React.memo(() => {
    return (
        <div>
            <input type="slider"></input>
        </div>
    )
})