import { Accessor, createComponent, createContext, createMemo, JSX, useContext } from "solid-js";
import { unwrap } from "solid-js/store";

import { to_pascal_case } from "lib/case";
import type { ITheme } from "lib/theme";
import type { IPrefsState } from "state/mutators/prefs";

import { UserPreferenceFlags, hasUserPrefFlag } from "state/models";
import { useRootStore } from "state/root";

export type UserPreferenceAccessors =
    & { [K in keyof typeof UserPreferenceFlags]: K extends string ? Accessor<boolean> : never; }
    & { [K in keyof IPrefsState as ToPascalCase<K>]: Accessor<IPrefsState[K]>; }
    & {
        UseMobileView: Accessor<boolean>;
        Theme: Accessor<ITheme>;
    };

export const UserPrefsContext = createContext<UserPreferenceAccessors>(null!);

export function UserPrefsProvider(props: { children: JSX.Element }) {
    let store = useRootStore(), accessors = {};

    for(let key in UserPreferenceFlags) {
        let flag = UserPreferenceFlags[key] as string | number;
        if(typeof flag === 'number') {
            accessors[key] = createMemo(() => hasUserPrefFlag(store.state.prefs, flag as UserPreferenceFlags));
        }
    }

    for(let key in unwrap(store.state).prefs) {
        accessors[to_pascal_case(key)] = () => store.state.prefs[key];
    }

    accessors['UseMobileView'] = () => store.state.window.use_mobile_view;
    accessors['Theme'] = (): ITheme => ({
        temperature: (accessors as UserPreferenceAccessors).Temp(),
        is_light: (accessors as UserPreferenceAccessors).LightMode(),
        oled: (accessors as UserPreferenceAccessors).OledMode(),
    });

    return createComponent(UserPrefsContext.Provider, {
        get value() { return accessors as UserPreferenceAccessors; },
        get children() { return props.children; }
    });
}

export function usePrefs(): UserPreferenceAccessors {
    return useContext(UserPrefsContext);
}
