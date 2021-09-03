import { useState } from "react"
import { useDispatch, useSelector } from "react-redux";
import { createStructuredSelector } from "reselect";

import { RootState } from "state/root";
import { setSession } from "state/commands";
import { fetch, XHRMethod } from "lib/fetch";

import { Glyphicon } from "ui/components/common/glyphicon";

import LogoutIcon from "icons/glyphicons-pro/glyphicons-basic-2-4/svg/individual-svg/glyphicons-basic-432-log-out.svg";


function genEmptySettings(name: string) {
    return () => {
        return <span>{name} Settings here</span>
    }
}

const SETTINGS = {
    'Account': genEmptySettings('Account'),
    'Profile': genEmptySettings('Profile'),
    'Appearance': genEmptySettings('Appearance'),
}

const KEYS = Object.keys(SETTINGS);

const settings_selector = createStructuredSelector({
    auth: (state: RootState) => state.user.session!.auth,
})

import "./settings.scss";
export const Settings = () => {
    let [page, setPage] = useState(KEYS[0]);

    let { auth } = useSelector(settings_selector);
    let dispatch = useDispatch();

    let Setting = SETTINGS[page];

    let logout = () => dispatch(
        fetch({
            url: "/api/v1/user/@me",
            method: XHRMethod.DELETE,
            bearer: auth,
        }).then(() => setSession(null))
    );

    return (
        <div className="ln-settings">
            <div className="ln-settings__nav">
                <ul>
                    {KEYS.map(key => (
                        <li key={key} onClick={() => setPage(key)}>
                            {key}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="ln-settings__setting"><Setting /></div>
            <div id="logout" onClick={logout} title="Logout">
                <Glyphicon src={LogoutIcon} />
            </div>
        </div>
    )
}