import { UserPreferenceFlags } from "state/models";
import { useI18nContext } from "ui/i18n/i18n-solid";

import { TogglePrefsFlag } from "../components/toggle";

export function MediaSettingsTab() {
    let { LL } = useI18nContext();

    return (
        <form class="ln-settings-form">
            <TogglePrefsFlag for="small_attachments"
                label={LL().main.settings.media.SMALL_ATTACHMENTS()}
                flag={UserPreferenceFlags.SmallerAttachments} />

            <TogglePrefsFlag for="show_grid"
                label={LL().main.settings.media.SHOW_ATTACHMENT_GRID()}
                flag={UserPreferenceFlags.ShowAttachmentGrid}
                subtext={LL().main.settings.media.SHOW_ATTACHMENT_GRID_SUBTEXT()} />

            <TogglePrefsFlag for="show_metadata"
                label={LL().main.settings.media.SHOW_MEDIA_METADATA()}
                flag={UserPreferenceFlags.ShowMediaMetadata}
                subtext={LL().main.settings.media.SHOW_MEDIA_METADATA_SUBTEXT()} />

            <TogglePrefsFlag for="mute_media"
                label={LL().main.settings.media.MUTE_MEDIA()}
                flag={UserPreferenceFlags.MuteMedia} />

            <TogglePrefsFlag for="hide_unknown"
                label={LL().main.settings.media.HIDE_UNKNOWN()}
                flag={UserPreferenceFlags.HideUnknown} />

            <TogglePrefsFlag for="use_platform_emojis"
                label={LL().main.settings.media.USE_PLATFORM_EMOJIS()}
                flag={UserPreferenceFlags.UsePlatformEmojis} />

            <TogglePrefsFlag for="enable_spellcheck"
                label={LL().main.settings.media.ENABLE_SPELLCHECK()}
                flag={UserPreferenceFlags.EnableSpellcheck} />
        </form>
    )
}