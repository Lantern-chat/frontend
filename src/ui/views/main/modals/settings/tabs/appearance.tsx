import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector, batch } from "react-redux";

import throttle from "lodash/throttle";

import { setTheme } from "state/commands/theme";
import { savePrefs, savePrefsFlag } from "state/commands/prefs";
import { Font, FONT_NAMES, UserPreferenceFlags } from "state/models";
import { themeSelector } from "state/selectors/theme";
import { selectPrefsFlag, selectGroupPad } from "state/selectors/prefs";
import { RootState } from "state/root";

import { FormGroup, FormInput, FormLabel, FormSelect } from "ui/components/form";

import { Toggle, TogglePrefsFlag } from "../components/toggle";
import { RadioSelect } from "../components/radio";

import { MIN_TEMP, MAX_TEMP } from "lib/theme";

import "./appearance.scss";
import { SizeSlider } from "../components/size-slider";
export const AppearanceSettingsTab = () => {
    return (
        <form className="ln-settings-form">
            <ThemeSetting />

            <FontSelector which="chat" />
            <FontSelector which="ui" />

            <ViewSelector />

            <TogglePrefsFlag htmlFor="group_lines" label="Show Lines Between Groups" flag={UserPreferenceFlags.GroupLines} />

            <GroupPaddingSlider />
        </form>
    );
};

const ThemeSetting = React.memo(() => {
    let input = useRef<HTMLInputElement>(null),
        theme = useSelector(themeSelector),
        dispatch = useDispatch(),
        [interactive, setInteractive] = useState(theme),
        doSetTheme = (temperature: number, is_light: boolean, oled: boolean) => {
            setInteractive({ temperature, is_light, oled });

            batch(() => {
                dispatch(setTheme(temperature, is_light, oled));
                dispatch(savePrefs({ temp: temperature }));
                dispatch(savePrefsFlag(UserPreferenceFlags.LightMode, is_light));
                dispatch(savePrefsFlag(UserPreferenceFlags.OledMode, !!oled));
            });
        };

    let onTempTouchMove = throttle((e: React.TouchEvent<HTMLInputElement>) => {
        if(input.current) {
            let { width, x } = input.current.getBoundingClientRect();
            let touch = e.touches[0].clientX - x;
            if(touch < 0 || touch > width) return;
            let t = touch / width, temperature = (1 - t) * MIN_TEMP + t * MAX_TEMP;
            doSetTheme(temperature, interactive.is_light, interactive.oled);
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
                    onChange={value => doSetTheme(interactive.temperature, value == 'light', interactive.oled)}
                />
            </div>

            <div className="ln-settings-temperature">
                <label htmlFor="temperature">Temperature</label>
                <div className="ln-theme-temp-slider" title="Change Theme Temperature">
                    <input ref={input} type="range" className="ln-slider" name="temperature"
                        min={MIN_TEMP} max={MAX_TEMP} step="1"
                        value={interactive.temperature}
                        onInput={e => doSetTheme(parseFloat(e.currentTarget.value), interactive.is_light, interactive.oled)}
                        onTouchMove={onTempTouchMove} onTouchStart={onTempTouchMove} />
                </div>
            </div>

            <Toggle htmlFor="oled_mode" label="Enable OLED Mode" checked={interactive.oled}
                onChange={(checked: boolean) => doSetTheme(interactive.temperature, interactive.is_light, checked)}
            />
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
    let select_name, select_label,
        prefs_key = which == 'chat' ? 'chat_font' : 'ui_font',
        size_prefs_key = which == 'ui' ? 'ui_font_size' : 'chat_font_size';

    let current_font = useSelector((state: RootState) => state.prefs[prefs_key]),
        current_size = useSelector((state: RootState) => state.prefs[size_prefs_key]),
        dispatch = useDispatch();

    let [font, setFont] = useState(Font[current_font]),
        [size, setSize] = useState(current_size);

    useEffect(() => setFont(Font[current_font]), [current_font]);
    useEffect(() => setSize(current_size), [current_size]);

    useEffect(() => {
        switch(Font[font]) {
            case Font.OpenDyslexic: { import("ui/fonts/opendyslexic"); break; }
            case Font.ComicSans: { import("ui/fonts/dramasans"); break; }
        }
    }, [font]);

    if(which == 'chat') {
        select_name = "Chat Font";
        select_label = 'chat_font';
    } else {
        select_name = "UI Font";
        select_label = 'ui_font';
    }

    let font_class = "ln-font-" + font.toLowerCase(),
        size_label = select_name + " Size";

    let onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        let font_name: keyof typeof Font = e.currentTarget.value as any;
        if(!Font.hasOwnProperty(font_name)) return;

        setFont(font_name);
        dispatch(savePrefs({
            [prefs_key]: Font[font_name]
        }));
    };

    let onSizeInput = (value: number) => {
        value = Math.round(value);

        setSize(value);
        dispatch(savePrefs({ [size_prefs_key]: value }));
    };

    return (
        <>
            <div className="ln-settings-font">
                <label htmlFor={select_label}>{select_name}</label>
                <div className="ln-settings-font__wrapper">
                    <div className="ln-settings-font__selector">
                        <FormSelect name={select_label} value={font} onChange={onChange}>
                            {Object.keys(FONT_NAMES).map((font) => (
                                <option value={font} key={font}
                                    className={"ln-font-" + font.toLowerCase()}>
                                    {FONT_NAMES[font]}
                                </option>
                            ))}
                        </FormSelect>
                    </div>
                    <div className={"ln-settings-font__example " + font_class} style={{ fontSize: `${size / 16}em` }}>
                        "The wizard quickly jinxed the gnomes before they vaporized."
                    </div>
                </div>
            </div>

            <SizeSlider htmlFor={size_prefs_key} label={size_label} min={8} max={32} step={1} value={size} onInput={onSizeInput} steps={[8, 12, 16, 20, 24, 32]} />
        </>
    )
});

const GroupPaddingSlider = React.memo(() => {
    let current_padding = useSelector(selectGroupPad),
        dispatch = useDispatch(),
        [pad, setPad] = useState(current_padding),
        onInput = (value: number) => {
            value = Math.round(value);

            setPad(value);
            dispatch(savePrefs({ pad: value }));
        };

    useEffect(() => setPad(current_padding), [current_padding]);

    return (
        <SizeSlider htmlFor="group_padding" label="Group Padding" min={0} max={32} step={1} value={pad} onInput={onInput} steps={[0, 12, 16, 24, 32]} />
    )
});

const FontSizeSlider = React.memo(({ which }: IFontSelectorProps) => {
    let prefs_key = which == 'ui' ? 'ui_font_size' : 'chat_font_size',
        current_size = useSelector((state: RootState) => state.prefs[prefs_key]),
        dispatch = useDispatch(),
        [size, setSize] = useState(current_size),
        onInput = (value: number) => {
            value = Math.round(value);

            setSize(value);
            dispatch(savePrefs({ [prefs_key]: value }));
        },
        label = (which == 'ui' ? 'UI' : 'Chat') + " Font Size";


    return (
        <SizeSlider htmlFor={prefs_key} label={label} min={8} max={32} step={1} value={size} onInput={onInput} steps={[8, 12, 16, 20, 24, 32]} />
    )
})