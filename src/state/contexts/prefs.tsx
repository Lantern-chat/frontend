import { Accessor, createContext, createMemo, JSX, useContext } from "solid-js";

import { UserPreferenceFlags, hasUserPrefFlag } from "state/models";
import { useRootStore } from "state/root";

export type UserPreferenceAccessors = {
    [K in keyof typeof UserPreferenceFlags]: K extends string ? Accessor<boolean> : never;
} & {
    UseMobileView: Accessor<boolean>;
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

    accessors['UseMobileView'] = createMemo(() => store.state.window.use_mobile_view);

    return (
        <UserPrefsContext.Provider value={accessors as UserPreferenceAccessors}>
            {props.children}
        </UserPrefsContext.Provider>
    );
}

export function usePrefs(): UserPreferenceAccessors {
    return useContext(UserPrefsContext);
}
