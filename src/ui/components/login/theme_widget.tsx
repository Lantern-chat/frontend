import { createStore } from "solid-js/store";
import { useRef } from "ui/hooks/useRef";
import { useRootSelector } from "state/root";
import { useDispatch } from "solid-mutant";

import { themeSelector } from "state/selectors/theme";
import { setTheme } from "state/commands/theme";

import { mix } from "lib/math";
import { MIN_TEMP, MAX_TEMP } from "lib/theme";

import { VectorIcon } from "ui/components/common/icon";
import { SunIcon, MoonIcon } from "lantern-icons";

import throttle from 'lodash/throttle';

import "./theme_widget.scss";
export function ThemeWidget() {
    let input = useRef<HTMLInputElement>(),
        theme = useRootSelector(themeSelector),
        dispatch = useDispatch();

    let [interactive, setInteractive] = createStore({ ...theme() });

    let doSetTheme = (temperature: number, is_light: boolean) => {
        let oled = interactive.oled;
        setInteractive({ temperature, is_light, oled });
        dispatch(setTheme(temperature, is_light, oled));
    };

    let onTempTouchMove = throttle((e: TouchEvent) => {
        if(input.current) {
            let { width, x } = input.current.getBoundingClientRect();
            let touch = e.touches[0].clientX - x;

            if(touch < 0 || touch > width) {
                return;
            }

            let t = touch / width, temperature = mix(MIN_TEMP, MAX_TEMP, t);

            doSetTheme(temperature, interactive.is_light);
        }
    }, 50, { trailing: true });

    return (
        <div className="ln-theme-widget" title="Change Theme">
            <div className="ln-theme-widget__icon" onClick={() => doSetTheme(interactive.temperature, !interactive.is_light)}>
                <VectorIcon src={interactive.is_light ? MoonIcon : SunIcon} />
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
}