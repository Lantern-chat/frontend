import { to_pascal_case } from "lib/case";
import { ITheme } from "lib/theme";
import { Accessor, createContext, createMemo, JSX, useContext } from "solid-js";
import { unwrap } from "solid-js/store";

import { UserPreferences, UserPreferenceFlags, hasUserPrefFlag } from "state/models";
import { IPrefsState } from "state/mutators/prefs";
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
    accessors['Theme'] = (): ITheme => {
        let prefs = accessors as UserPreferenceAccessors;
        return {
            temperature: prefs.Temp(),
            is_light: prefs.LightMode(),
            oled: prefs.OledMode(),
        };
    };

    return (
        <UserPrefsContext.Provider value={accessors as UserPreferenceAccessors}>
            {props.children}
        </UserPrefsContext.Provider>
    );
}

export function usePrefs(): UserPreferenceAccessors {
    return useContext(UserPrefsContext);
}
