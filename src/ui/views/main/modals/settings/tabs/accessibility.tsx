import { UserPreferenceFlags } from "state/models";
import { useI18nContext } from "ui/i18n/i18n-solid";
import { TogglePrefsFlag } from "../components/toggle";

export function AccessibilitySettingsTab() {
    let { LL } = useI18nContext();

    return (
        <form className="ln-settings-form">
            <TogglePrefsFlag htmlFor="reduce_motion"
                label={LL().main.settings.accessibility.REDUCE_MOTION()}
                flag={UserPreferenceFlags.ReduceAnimations} />

            <TogglePrefsFlag htmlFor="unfocus_pause"
                label={LL().main.settings.accessibility.UNFOCUS_PAUSE()}
                flag={UserPreferenceFlags.UnfocusPause} />
        </form>
    );
}