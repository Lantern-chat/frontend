import { UserPreferenceFlags } from "state/models";
import { useI18nContext } from "ui/i18n/i18n-solid";

import { TogglePrefsFlag } from "../components/toggle";


export function PrivacySettingsTab() {
    let { LL } = useI18nContext();

    return (
        <form class="ln-settings-form">
            <TogglePrefsFlag for="hide_last_active"
                label={LL().main.settings.privacy.HIDE_LAST_ACTIVE()}
                flag={UserPreferenceFlags.HideLastActive}
                subtext={LL().main.settings.privacy.HIDE_LAST_ACTIVE_SUBTEXT()} />
        </form>
    )
}