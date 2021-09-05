import React, { useCallback, useEffect, useState } from "react";
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

    let return_path = useSelector(return_path_selector),
        do_return = useCallback(() => {
            if(!closing) {
                setClosing(true);
                setTimeout(() => HISTORY.push(return_path), 200);
            }
        }, [return_path, closing]);

    useEffect(() => {
        let listener = (e: KeyboardEvent) => { if(e.key == 'Escape') { do_return(); } };
        window.addEventListener('keyup', listener);
        return () => window.removeEventListener('keyup', listener);
    }, []);

    return (
        <Modal>
            <div className={"ln-modal ln-settings ln-settings--" + (closing ? 'closing' : 'opened')}>
                <SettingsTabs do_return={do_return} />
            </div>
        </Modal>
    )
});

import { ProfileSettingsTab } from "./tabs/profile";
import { AppearanceSettingsTab } from "./tabs/appearance";
import { AccountSettingsTab } from "./tabs/account";
import { PrivacySettingsTab } from "./tabs/privacy";
import { NotificationsSettingsTab } from "./tabs/notifications";
import { AccessibilitySettingsTab } from "./tabs/accessibility";
import { MediaSettingsTab } from "./tabs/media";
import { LanguageSettingsTab } from "./tabs/language";

import LogoutIcon from "icons/glyphicons-pro/glyphicons-basic-2-4/svg/individual-svg/glyphicons-basic-432-log-out.svg";

const TABS = [
    { name: 'Account', path: 'account', comp: AccountSettingsTab },
    { name: 'Profile', path: 'profile', comp: ProfileSettingsTab },
    { name: 'Privacy', path: 'privacy', comp: PrivacySettingsTab },
    { name: 'Notifications', path: 'notifications', comp: NotificationsSettingsTab },
    { name: 'Appearance', path: 'appearance', comp: AppearanceSettingsTab },
    { name: 'Accessibility', path: 'accessibility', comp: AccessibilitySettingsTab },
    { name: 'Text & Media', path: 'media', comp: MediaSettingsTab },
    { name: 'Language', path: 'language', comp: LanguageSettingsTab },
];

interface ISettingsTabsProps {
    do_return: () => void,
}

import { logout } from "state/commands/session";

const SettingsTabs = React.memo(({ do_return }: ISettingsTabsProps) => {
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
                        <li key={name} className={(tab.path == path ? 'selected' : '')}>
                            <Link href={`/settings/${path}`} title={name}> <div><span>{name}</span></div> </Link>
                        </li>
                    ))}

                    <div className="spacer" />

                    <hr />

                    <li>
                        <div id="logout" onClick={do_logout} title="Logout">
                            <span>Logout</span>
                            <div>
                                <Glyphicon src={LogoutIcon} />
                            </div>
                        </div>
                    </li>
                </ul>
            </div>

            <div className="ln-settings__page">
                <div className="ln-settings__header">
                    <h3>{tab.name}</h3>
                    <div onClick={do_return}><span>Return</span></div>
                </div>

                <div className="ln-settings__content">
                    <TabComponent />
                </div>
            </div>
        </>
    );
});
