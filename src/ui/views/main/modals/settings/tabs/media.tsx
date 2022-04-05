import { UserPreferenceFlags } from "state/models";
import { useI18nContext } from "ui/i18n/i18n-solid";

import { TogglePrefsFlag } from "../components/toggle";

export function MediaSettingsTab() {
    let { LL } = useI18nContext();

    return (
        <form className="ln-settings-form">
            <TogglePrefsFlag htmlFor="mute_media"
                label={LL().main.settings.media.MUTE_MEDIA()}
                flag={UserPreferenceFlags.MuteMedia} />

            <TogglePrefsFlag htmlFor="hide_unknown"
                label={LL().main.settings.media.HIDE_UNKNOWN()}
                flag={UserPreferenceFlags.HideUnknown} />

            <TogglePrefsFlag htmlFor="use_platform_emojis"
                label={LL().main.settings.media.USE_PLATFORM_EMOJIS()}
                flag={UserPreferenceFlags.UsePlatformEmojis} />

            <TogglePrefsFlag htmlFor="enable_spellcheck"
                label={LL().main.settings.media.ENABLE_SPELLCHECK()}
                flag={UserPreferenceFlags.EnableSpellcheck} />
        </form>
    )
}