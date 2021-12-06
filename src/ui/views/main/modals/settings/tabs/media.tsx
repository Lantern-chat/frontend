import { UserPreferenceFlags } from "state/models";

import { TogglePrefsFlag } from "../components/toggle";

export const MediaSettingsTab = () => {
    return (
        <form className="ln-settings-form">
            <TogglePrefsFlag htmlFor="mute_media" label="Mute Media by Default" flag={UserPreferenceFlags.MuteMedia} />

            <TogglePrefsFlag htmlFor="hide_unknown" label="Disable Attachments of Unknown Size" flag={UserPreferenceFlags.HideUnknown} />

            <TogglePrefsFlag htmlFor="use_platform_emojis" label="Use Platform Emojis" flag={UserPreferenceFlags.UsePlatformEmojis} />
        </form>
    )
};