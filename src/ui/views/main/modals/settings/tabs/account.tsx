import { createMemo, createRenderEffect, Show } from "solid-js";
import { createStructuredSelector, useDispatch, useSelector, useStore, useStructuredSelector } from "solid-mutant";

import { fetch_quota } from "state/commands/sendfile";
import { Action, RootState } from "state/root";
import { format_bytes } from "lib/formatting";
import { TogglePrefsFlag } from "../components/toggle";
import { UserPreferenceFlags } from "state/models";

export const AccountSettingsTab = () => {
    let store = useStore<RootState, Action>(),
        dispatch = store.dispatch,
        state = store.state;

    createRenderEffect(() => {
        if(state.user.user) {
            dispatch(fetch_quota());
        }
    });

    let quota = createMemo(() => {
        let user = state.user;
        if(user.quota_total !== undefined && user.quota_used !== undefined) {
            let used = format_bytes(user.quota_used),
                total = format_bytes(user.quota_total),
                percent = (100 * user.quota_used / user.quota_total).toFixed(1);

            return { used, total, percent };
        }
        return;
    });

    return (
        <Show when={state.user.user} fallback={<div>Loading...</div>}>
            <div>Username: {state.user.user!.username}</div>
            <div>Email: {state.user.user!.email}</div>
            <div>Change Password</div>
            <div>2-Factor Authentication</div>

            <Show when={quota()}>
                {({ used, total, percent }) => (
                    <div>
                        <span>{used}/{total} ({percent}%) Upload Quota Used</span>
                    </div>
                )}
            </Show>

            <TogglePrefsFlag flag={UserPreferenceFlags.DeveloperMode} htmlFor="dev_mode" label="Enable Developer Mode" />
        </Show>
    )
};