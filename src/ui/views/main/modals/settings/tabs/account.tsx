import { createMemo, createRenderEffect, Show } from "solid-js";
import { createStructuredSelector, useDispatch, useSelector, useStore, useStructuredSelector } from "solid-mutant";

import { fetch_quota } from "state/commands/sendfile";
import { Action, RootState } from "state/root";
import { format_bytes } from "lib/formatting";
import { TogglePrefsFlag } from "../components/toggle";
import { UserPreferenceFlags } from "state/models";
import { createBytesFormatter, createNumberFormatter } from "ui/hooks/createFormatter";
import { useI18nContext } from "ui/i18n/i18n-solid";

export const AccountSettingsTab = () => {
    let store = useStore<RootState, Action>(),
        dispatch = store.dispatch,
        state = store.state;

    let { LL } = useI18nContext();

    let bytes_formatter = createBytesFormatter();
    let num_formatter = createNumberFormatter({
        maximumFractionDigits: 1,
        style: 'unit',
        unit: 'percent'
    } as any);

    createRenderEffect(() => {
        if(state.user.user) {
            dispatch(fetch_quota());
        }
    });

    let quota = createMemo(() => {
        let user = state.user;
        if(user.quota_total !== undefined && user.quota_used !== undefined) {
            let used = bytes_formatter(user.quota_used),
                total = bytes_formatter(user.quota_total),
                percent = num_formatter(100 * user.quota_used / user.quota_total);

            return { used, total, percent };
        }
        return;
    });

    return (
        <Show when={state.user.user} fallback={<div textContent={LL().LOADING()} />}>
            <div>Username: {state.user.user!.username}</div>
            <div>Email: {state.user.user!.email}</div>
            <div>Change Password</div>
            <div>2-Factor Authentication</div>

            <Show when={quota()}>
                <div>
                    <span>{LL().main.settings.account.QUOTA(quota()!)}</span>
                </div>
            </Show>

            <TogglePrefsFlag flag={UserPreferenceFlags.DeveloperMode} htmlFor="dev_mode"
                label={LL().main.settings.account.DEV_MODE()} />
        </Show>
    )
};