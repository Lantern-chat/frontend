import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { savePrefsFlag } from "state/commands/prefs";
import { UserPreferenceFlags } from "state/models";
import { selectPrefsFlag } from "state/selectors/prefs";
import { TogglePrefsFlag } from "../components/toggle";

export const AccessibilitySettingsTab = () => {
    return (
        <form className="ln-settings-form">
            <TogglePrefsFlag htmlFor="reduce_motion" label="Reduce Motion" flag={UserPreferenceFlags.ReduceAnimations} />
        </form>
    )
};