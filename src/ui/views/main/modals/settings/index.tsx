import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createStructuredSelector, createSelector } from "reselect";

import { RootState } from "state/root";
import { HISTORY } from "state/global";
import { activeParty, activeRoom } from "state/selectors/active";
import { room_url } from "config/urls";

import { Link } from "ui/components/history";
import { Modal } from "ui/components/modal";
import { Glyphicon } from "ui/components/common/glyphicon";

let return_path_selector = createSelector(
    activeParty,
    activeRoom,
    (active_party, active_room) => room_url(active_party || '@me', active_room),
);

import "../modal.scss";
import "./settings.scss";
export const SettingsModal = React.memo(() => {
    let [closing, setClosing] = useState(false);

    let return_path = useSelector(return_path_selector);

    useEffect(() => {
        let listener = (e: KeyboardEvent) => {
            if(e.key == 'Escape' && !closing) {
                setClosing(true);
                setTimeout(() => HISTORY.push(return_path), 200);
            }
        }
        window.addEventListener('keyup', listener);
        return () => window.removeEventListener('keyup', listener);
    }, []);

    return (
        <Modal>
            <div className={"ln-modal ln-settings ln-settings--" + (closing ? 'closing' : 'opened')}>
                <SettingsTabs />
            </div>
        </Modal>
    )
});

import { ProfileSettingsTab } from "./tabs/profile";
import { AppearanceSettingsTab } from "./tabs/appearance";
import { logout } from "state/commands/session";

import LogoutIcon from "icons/glyphicons-pro/glyphicons-basic-2-4/svg/individual-svg/glyphicons-basic-432-log-out.svg";


const TABS = [
    { name: 'Profile', path: 'profile', comp: ProfileSettingsTab },
    { name: 'Appearance', path: 'appearance', comp: AppearanceSettingsTab },
];

const SettingsTabs = React.memo(() => {
    let active_tab = useSelector((state: RootState) => state.history.parts[1]),
        tab = TABS.find(tab => tab.path == active_tab) || TABS[0],
        TabComponent = tab.comp,
        dispatch = useDispatch(),
        do_logout = () => dispatch(logout());

    return (
        <>
            <div className="ln-settings__categories">
                <h3>Settings</h3>

                <ul>
                    {TABS.map(({ name, path }) => (
                        <li key={name}>
                            <div className={(active_tab == path ? 'selected' : '')}>
                                <Link href={`/settings/${path}`}> {name} </Link>
                            </div>
                        </li>
                    ))}

                    <hr />

                    <li>
                        <div id="logout" onClick={do_logout}>
                            Logout
                            <div title="Logout">
                                <Glyphicon src={LogoutIcon} />
                            </div>
                        </div>
                    </li>
                </ul>


            </div>

            <div className="ln-settings__page">
                <h3>{tab.name}</h3>

                <div className="ln-settings__content">
                    <TabComponent />
                </div>
            </div>
        </>
    );
});
