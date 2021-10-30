import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector, batch } from "react-redux";

import throttle from "lodash/throttle";

import { setTheme } from "state/commands/theme";
import { savePrefs, savePrefsFlag } from "state/commands/prefs";
import { Font, FONT_NAMES, UserPreferenceFlags } from "state/models";
import { themeSelector } from "state/selectors/theme";
import { selectPrefsFlag } from "state/selectors/prefs";
import { RootState } from "state/root";

import { FormGroup, FormInput, FormLabel, FormSelect } from "ui/components/form";

import { TogglePrefsFlag } from "../components/toggle";
import { RadioSelect } from "../components/radio";

import { MIN_TEMP, MAX_TEMP } from "lib/theme";

import "./appearance.scss";
export const AppearanceSettingsTab = () => {
    return (
        <form className="ln-settings-form">
            <ThemeSetting />

            <ViewSelector />

            <TogglePrefsFlag htmlFor="group_lines" label="Show Lines Between Groups" flag={UserPreferenceFlags.GroupLines} />

            <FontSelector which="chat" />
            <FontSelector which="ui" />

            <GroupPaddingSlider />
        </form>
    );
};

const ThemeSetting = React.memo(() => {
    let input = useRef<HTMLInputElement>(null),
        theme = useSelector(themeSelector),
        dispatch = useDispatch(),
        [interactive, setInteractive] = useState(theme),
        doSetTheme = (temperature: number, is_light: boolean) => {
            setInteractive({ temperature, is_light });

            batch(() => {
                dispatch(setTheme(temperature, is_light));
                dispatch(savePrefs({ temp: temperature }));
                dispatch(savePrefsFlag(UserPreferenceFlags.LightMode, is_light));
            });
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
                <label>Theme</label>
                <RadioSelect
                    name="light_theme"
                    options={[["light", "Light Theme"], ["dark", "Dark Theme"]]}
                    selected={interactive.is_light ? 'light' : 'dark'}
                    onChange={value => doSetTheme(interactive.temperature, value == 'light')}
                />
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

const ViewSelector = React.memo(() => {
    let current_compact = useSelector(selectPrefsFlag(UserPreferenceFlags.CompactView)),
        dispatch = useDispatch(),
        [compact, setCompact] = useState(current_compact),
        onChange = (value: string) => {
            let compact = value == 'compact';

            setCompact(compact);

            batch(() => {
                dispatch(savePrefs({ pad: compact ? 0 : 16 }));
                dispatch(savePrefsFlag(UserPreferenceFlags.CompactView, compact));
            })
        };

    return (
        <div>
            <label>View Mode</label>
            <RadioSelect
                name="view"
                options={[["cozy", "Cozy"], ["compact", "Compact"]]}
                selected={compact ? 'compact' : 'cozy'}
                onChange={onChange}
            />
        </div>
    );
});

interface IFontSelectorProps {
    which: 'chat' | 'ui',
}

const FontSelector = React.memo(({ which }: IFontSelectorProps) => {
    let name, label, prefs_key = which == 'chat' ? 'chat_font' : 'ui_font';

    let current_font = useSelector((state: RootState) => state.prefs[prefs_key]);
    let dispatch = useDispatch();

    // if we get new state from the server while this component is running, force an update to the selection
    let [font, setFont] = useState(Font[current_font]);
    useEffect(() => setFont(Font[current_font]), [current_font]);

    useEffect(() => {
        switch(Font[font]) {
            case Font.OpenDyslexic: { import("ui/fonts/opendyslexic"); break; }
            case Font.ComicSans: { import("ui/fonts/dramasans"); break; }
        }
    }, [font]);

    if(which == 'chat') {
        name = "Chat Font";
        label = 'chat_font';
    } else {
        name = "UI Font";
        label = 'ui_font';
    }

    let font_class = "ln-font-" + font.toLowerCase();

    let onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        let font_name: keyof typeof Font = e.currentTarget.value as any;
        if(!Font.hasOwnProperty(font_name)) return;

        setFont(font_name);
        dispatch(savePrefs({
            [prefs_key]: Font[font_name]
        }));
    };

    return (
        <div className="ln-settings-font">
            <label htmlFor={label}>{name}</label>
            <div className="ln-settings-font__wrapper">
                <div className="ln-settings-font__selector">
                    <FormSelect name={label} value={font} onChange={onChange}>
                        {Object.keys(FONT_NAMES).map((font) => (
                            <option value={font} key={font}
                                className={"ln-font-" + font.toLowerCase()}>
                                {FONT_NAMES[font]}
                            </option>
                        ))}
                    </FormSelect>
                </div>
                <div className={"ln-settings-font__example " + font_class}>
                    The wizard quickly jinxed the gnomes before they vaporized.
                </div>
            </div>
        </div>
    )
});

const FontScale = React.memo(() => {
    return (
        <div>
            <input type="range"></input>
        </div>
    )
});

const GroupPaddingSlider = React.memo(() => {
    let current_padding = useSelector((state: RootState) => state.prefs.pad),
        dispatch = useDispatch(),
        [pad, setPad] = useState(current_padding),
        onInput = (e: React.FormEvent<HTMLInputElement>) => {
            let value = Math.round(parseFloat(e.currentTarget.value));

            setPad(value);
            dispatch(savePrefs({ pad: value }));
        };

    useEffect(() => setPad(current_padding), [current_padding]);

    return (
        <div className="ln-settings-pad">
            <label htmlFor="group_padding">Group Padding</label>
            <div>
                <input type="range" name="group_padding" min="0" max="32" step="1" value={pad} onInput={onInput}></input>
            </div>
        </div>
    )
});