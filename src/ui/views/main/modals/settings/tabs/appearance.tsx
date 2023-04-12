import { createEffect, createMemo, createSignal, For } from "solid-js";
import { createStore } from "solid-js/store";
import { useStructuredSelector } from "solid-mutant";

import throttle from "lodash/throttle";
import { mix } from "lib/math";

import { useI18nContext } from "ui/i18n/i18n-solid";
import { setTheme } from "state/commands/theme";
import { usePrefs } from "state/contexts/prefs";
import { savePrefs, savePrefsFlag } from "state/commands/prefs";
import { Font, FONT_NAMES, UserPreferenceFlags } from "state/models";
import { selectGroupPad } from "state/selectors/prefs";
import { RootState, useRootDispatch, useRootSelector } from "state/root";

import { FormGroup, FormInput, FormLabel, FormSelect } from "ui/components/form";

import { Toggle, TogglePrefsFlag } from "../components/toggle";
import { RadioSelect } from "../components/radio";
import { SizeSlider } from "../components/size-slider";

import { MIN_TEMP, MAX_TEMP } from "lib/theme";

import "./appearance.scss";
export const AppearanceSettingsTab = () => {
    let { LL } = useI18nContext();

    return (
        <form class="ln-settings-form">
            <ThemeSetting />

            <FontSelector which="chat" />
            <FontSelector which="ui" />

            <ViewSelector />

            <TogglePrefsFlag for="date_change"
                label={LL().main.settings.appearance.SHOW_DATE_CHANGE()}
                flag={UserPreferenceFlags.ShowDateChange} />

            <TogglePrefsFlag for="group_lines"
                label={LL().main.settings.appearance.GROUP_LINES()}
                flag={UserPreferenceFlags.GroupLines} />

            <GroupPaddingSlider />
        </form>
    );
};

function ThemeSetting() {
    let input: HTMLInputElement | undefined,
        prefs = usePrefs(),
        dispatch = useRootDispatch(),
        [interactive, setInteractive] = createStore({ ...prefs.Theme() }),
        doSetTheme = (temperature: number, is_light: boolean, oled: boolean) => {
            setInteractive({ temperature, is_light, oled });

            dispatch([
                setTheme(temperature, is_light, oled),
                savePrefs({ temp: temperature }),
                savePrefsFlag(UserPreferenceFlags.LightMode, is_light),
                savePrefsFlag(UserPreferenceFlags.OledMode, !!oled)
            ]);
        };

    let onTempTouchMove = throttle((e: TouchEvent) => {
        let { width, x } = input!.getBoundingClientRect();
        let touch = e.touches[0].clientX - x;
        if(touch < 0 || touch > width) return;
        let t = touch / width, temperature = mix(MIN_TEMP, MAX_TEMP, t);
        doSetTheme(temperature, interactive.is_light, interactive.oled);
    }, 50, { trailing: true });

    let { LL } = useI18nContext();

    return (
        <>
            <div>
                <label>{LL().main.settings.appearance.THEME()}</label>
                <RadioSelect
                    name="light_theme"
                    options={[
                        ["light", LL().main.settings.appearance.LIGHT_THEME()],
                        ["dark", LL().main.settings.appearance.DARK_THEME()]
                    ]}
                    selected={interactive.is_light ? "light" : "dark"}
                    onChange={value => doSetTheme(interactive.temperature, value == "light", interactive.oled)}
                />
            </div>

            <div class="ln-settings-temperature">
                <label for="temperature">{LL().main.settings.appearance.TEMP()}</label>
                <div class="ln-theme-temp-slider" title={LL().CHANGE_THEME_TEMP()}>
                    <input ref={input} type="range" class="ln-slider" name="temperature"
                        min={MIN_TEMP} max={MAX_TEMP} step="1"
                        value={interactive.temperature}
                        onInput={e => doSetTheme(parseFloat(e.currentTarget.value), interactive.is_light, interactive.oled)}
                        onTouchMove={onTempTouchMove} onTouchStart={onTempTouchMove} />
                </div>
            </div>

            <Toggle for="oled_mode"
                label={LL().main.settings.appearance.OLED_THEME()}
                checked={interactive.oled}
                disabled={interactive.is_light}
                onChange={(checked: boolean) => doSetTheme(interactive.temperature, interactive.is_light, checked)}
            />
        </>
    )
}

function ViewSelector() {
    let prefs = usePrefs(),
        dispatch = useRootDispatch(),
        [compact, setCompact] = createSignal(prefs.CompactView()),
        onChange = (value: string) => {
            let compact = value == "compact";

            setCompact(compact);
            dispatch([
                savePrefs({ pad: compact ? 0 : 16 }),
                savePrefsFlag(UserPreferenceFlags.CompactView, compact),
            ]);
        };

    let { LL } = useI18nContext();

    return (
        <div>
            <label>{LL().main.settings.appearance.VIEW_MODE()}</label>
            <RadioSelect
                name="view"
                options={[
                    ["cozy", LL().main.settings.appearance.COZY()],
                    ["compact", LL().main.settings.appearance.COMPACT()]
                ]}
                selected={compact() ? "compact" : "cozy"}
                onChange={onChange}
            />
        </div>
    );
}

interface IFontSelectorProps {
    which: "chat" | "ui",
}

function FontSelector(props: IFontSelectorProps) {
    let prefs_key = createMemo(() => props.which == "chat" ? "chat_font" : "ui_font");
    let size_prefs_key = createMemo(() => props.which == "ui" ? "ui_font_size" : "chat_font_size");

    let state = useStructuredSelector({
        current_font: (state: RootState) => state.prefs[prefs_key()],
        current_size: (state: RootState) => state.prefs[size_prefs_key()],
    });

    let dispatch = useRootDispatch();

    let [font, setFont] = createSignal(Font[state.current_font]),
        [size, setSize] = createSignal(state.current_size);

    // update local state when store values change
    createEffect(() => setFont(Font[state.current_font]));
    createEffect(() => setSize(state.current_size));

    let onChange = (e: Event) => {
        let font_name: keyof typeof Font = (e.currentTarget as HTMLSelectElement).value as any;
        if(!Font.hasOwnProperty(font_name)) return;

        setFont(font_name);
        dispatch(savePrefs({
            [prefs_key()]: Font[font_name]
        }));
    };

    let onSizeInput = (value: number) => {
        value = Math.round(value);
        setSize(value);
        dispatch(savePrefs({ [size_prefs_key()]: value }));
    };

    let { LL } = useI18nContext();

    return (
        <>
            <div class="ln-settings-font">
                <label for={prefs_key()}>
                    {props.which == "chat" ?
                        LL().main.settings.appearance.CHAT_FONT_FAMILY() :
                        LL().main.settings.appearance.UI_FONT_FAMILY()}
                </label>

                <div class="ln-settings-font__wrapper">
                    <div class="ln-settings-font__selector">
                        <FormSelect name={prefs_key()} value={font()} onChange={onChange}>
                            <For each={Object.keys(FONT_NAMES)}>
                                {font => (
                                    <option value={font} class={"ln-font-" + font.toLowerCase()}>
                                        {FONT_NAMES[font as keyof typeof FONT_NAMES]}
                                    </option>
                                )}
                            </For>
                        </FormSelect>
                    </div>

                    <div class={"ln-settings-font__example ln-font-" + font().toLowerCase()} style={{ "font-size": `${size() / 16}em` }}>
                        {LL().main.settings.appearance.FONT_EXAMPLE()}
                    </div>
                </div>
            </div>

            <SizeSlider for={size_prefs_key()} value={size()} onInput={onSizeInput}
                label={props.which == "chat" ?
                    LL().main.settings.appearance.CHAT_FONT_SIZE() :
                    LL().main.settings.appearance.UI_FONT_SIZE()}
                min={8} max={32} step={1} steps={[8, 12, 16, 20, 24, 32]} />
        </>
    )
}

function GroupPaddingSlider() {
    let current_padding = useRootSelector(selectGroupPad),
        [pad, setPad] = createSignal(current_padding()),
        dispatch = useRootDispatch(),
        onInput = (value: number) => {
            value = Math.round(value);

            setPad(value);
            dispatch(savePrefs({ pad: value }));
        };

    // update local padding value when selected value changes
    createEffect(() => setPad(current_padding()));

    let { LL } = useI18nContext();

    return (
        <SizeSlider for="group_padding"
            label={LL().main.settings.appearance.GROUP_PADDING()}
            value={pad()} onInput={onInput}
            min={0} max={32} step={1} steps={[0, 12, 16, 24, 32]} />
    )
}