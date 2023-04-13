import { createRenderEffect, Show } from "solid-js";

import { fetch_quota } from "state/commands/sendfile";
import { useRootStore } from "state/root";
import { TogglePrefsFlag } from "../components/toggle";
import { UserPreferenceFlags } from "state/models";
import { useI18nContext } from "ui/i18n/i18n-solid";

export const AccountSettingsTab = () => {
    let store = useRootStore(),
        dispatch = store.dispatch,
        state = store.state;

    let { LL } = useI18nContext();

    createRenderEffect(() => {
        if(state.user.user) {
            dispatch(fetch_quota());
        }
    });

    let quota = () => {
        let user = state.user;
        if(user.quota_total !== undefined && user.quota_used !== undefined) {
            return {
                used: user.quota_used,
                total: user.quota_total,
                percent: user.quota_used / user.quota_total
            };
        }
        return;
    };

    return (
        <Show when={state.user.user} fallback={<div textContent={LL().LOADING()} />}>
            <div>Username: {state.user.user!.username}</div>
            <div>Email: {state.user.user!.email}</div>
            <div>Change Password</div>
            <div>2-Factor Authentication</div>

            <Show when={quota()}>
                {quota => (
                    <div>
                        <span>{LL().main.settings.account.QUOTA(quota())}</span>
                    </div>
                )}
            </Show>

            <TogglePrefsFlag flag={UserPreferenceFlags.DeveloperMode} for="dev_mode"
                label={LL().main.settings.account.DEV_MODE()} />
        </Show>
    )
};