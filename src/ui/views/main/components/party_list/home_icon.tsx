import { createEffect, createMemo } from "solid-js";
import { useRef } from "ui/hooks/useRef";

import { useRootSelector } from "state/root";
import { themeSelector } from "state/selectors/theme";

import { Avatar } from "ui/components/common/avatar";
import { VectorIcon } from "ui/components/common/icon";
import { Link } from "ui/components/history";

import { HomeIcon } from "lantern-icons";

export interface IHomeProps {
    active_party: string | undefined,
    can_navigate: boolean,
}

export function Home(props: IHomeProps) {
    let theme = useRootSelector(themeSelector);

    let ref = useRef<HTMLLIElement>();

    createEffect(() => {
        let li = ref.current;
        if(li) {
            li.style.setProperty('--ln-home-color', compute_color(theme()));
        }
    });

    let onNavigate = (e: Event) => {
        ('@me' != props.active_party && props.can_navigate) || e.preventDefault()
    };

    return (
        <li id="user-home" className={'@me' == props.active_party ? 'selected' : ''} ref={ref}>
            <Link title="Home" href="/channels/@me" onNavigate={onNavigate} >
                <Avatar rounded username="Home">
                    <VectorIcon src={HomeIcon} />
                </Avatar>
            </Link>
        </li>
    )
}

import { ITheme, MAX_TEMP, MIN_TEMP } from "lib/theme";
import { change_color, formatRGBHex, kelvin2 } from "lib/color";
import { gaussian2, mix } from "lib/math";

function compute_color(theme: ITheme): string {
    let { temperature, is_light } = theme;

    let s, l, c = kelvin2(Math.max(6000, Math.min(theme.temperature, 12000)));

    if(!is_light) {
        // lopsided upside-down gaussian, slower to rise on the hotter side
        let t = 1 - gaussian2(temperature - 6500, (temperature - MIN_TEMP) * 0.1);
        t *= t; // flatten it out a bit

        s = mix(0.05, 0.65, t);
        l = mix(0.25, 0.55, t);

    } else {
        // TODO: Improve this light theme color
        s = (temperature - 7000) / 19000;
        s *= s;
        s += 0.5;

        l = (temperature - 6500) / (1.5 * MAX_TEMP - MIN_TEMP);
        l *= -l;
        l += 0.99;
    }

    return formatRGBHex(change_color(c, { s, l }))
}