import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createStructuredSelector } from "reselect";
import { fetch_quota } from "state/commands/sendfile";
import { RootState } from "state/root";
import { format_bytes } from "lib/formatting";
import { TogglePrefsFlag } from "../components/toggle";
import { UserPreferenceFlags } from "state/models";

let account_selector = createStructuredSelector({
    iuser: (state: RootState) => state.user,
});

export const AccountSettingsTab = () => {
    let dispatch = useDispatch();
    let { iuser } = useSelector(account_selector), user = iuser.user;

    useEffect(() => {
        if(user) {
            dispatch(fetch_quota());
        }
    }, [user]);

    if(!user) {
        return (
            <div>Loading...</div>
        )
    }

    let quota;
    if(iuser.quota_total !== undefined && iuser.quota_used !== undefined) {
        let used = format_bytes(iuser.quota_used),
            total = format_bytes(iuser.quota_total),
            percent = (100 * iuser.quota_used / iuser.quota_total).toFixed(1);

        quota = (
            <span>
                {used}/{total} ({percent}%) Upload Quota Used
            </span>
        )
    } else {
        quota = <span>Loading Upload Quota...</span>;
    }

    return (
        <>
            <div>Username: {user.username}</div>
            <div>Email: {user.email}</div>
            <div>Change Password</div>
            <div>2-Factor Authentication</div>
            <div>{quota}</div>
            <TogglePrefsFlag flag={UserPreferenceFlags.DeveloperMode} htmlFor="dev_mode" label="Enable Developer Mode" />
        </>
    );
};