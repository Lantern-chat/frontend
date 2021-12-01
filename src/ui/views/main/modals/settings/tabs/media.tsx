import { UserPreferenceFlags } from "state/models";

import { TogglePrefsFlag } from "../components/toggle";

export const MediaSettingsTab = () => {
    return (
        <form className="ln-settings-form">
            <TogglePrefsFlag htmlFor="mute_media" label="Mute Media by Default" flag={UserPreferenceFlags.MuteMedia} />
        </form>
    )
};