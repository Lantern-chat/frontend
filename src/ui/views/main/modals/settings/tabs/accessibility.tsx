import { UserPreferenceFlags } from "state/models";
import { useI18nContext } from "ui/i18n/i18n-solid";
import { TogglePrefsFlag } from "../components/toggle";

export function AccessibilitySettingsTab() {
    let { LL } = useI18nContext();

    return (
        <form class="ln-settings-form">
            <TogglePrefsFlag for="reduce_motion"
                label={LL().main.settings.accessibility.REDUCE_MOTION()}
                flag={UserPreferenceFlags.ReduceAnimations}
                subtext={LL().main.settings.accessibility.REDUCE_MOTION_SUBTEXT()} />

            <TogglePrefsFlag for="unfocus_pause"
                label={LL().main.settings.accessibility.UNFOCUS_PAUSE()}
                flag={UserPreferenceFlags.UnfocusPause} />

            <TogglePrefsFlag for="low_bandwidth"
                label={LL().main.settings.accessibility.LOW_BANDWIDTH()}
                flag={UserPreferenceFlags.LowBandwidthMode}
                subtext={LL().main.settings.accessibility.LOW_BANDWIDTH_SUBTEXT()} />

            <TogglePrefsFlag for="force_constrast"
                label={LL().main.settings.accessibility.FORCE_COLOR_CONTRAST()}
                flag={UserPreferenceFlags.ForceColorConstrast}
                subtext={LL().main.settings.accessibility.FORCE_COLOR_CONTRAST_SUBTEXT()} />
        </form>
    );
}