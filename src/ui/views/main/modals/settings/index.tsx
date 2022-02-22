import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createStructuredSelector, createSelector } from "reselect";

import { RootState } from "state/root";
import { HISTORY } from "state/global";
import { activeParty, activeRoom } from "state/selectors/active";
import { room_url } from "config/urls";

import { Link } from "ui/components/history";
import { Modal } from "ui/components/modal";
import { VectorIcon } from "ui/components/common/icon";

let return_path_selector = createSelector(
    activeParty,
    activeRoom,
    (active_party, active_room) => room_url(active_party || '@me', active_room),
);

import "../modal.scss";
import "./settings.scss";
import "./tabs/_tab.scss";
export const SettingsModal = React.memo(() => {
    let [closing, setClosing] = useState(false);

    let return_path = useSelector(return_path_selector),
        do_return = useCallback(() => {
            if(!closing) {
                setClosing(true);
                setTimeout(() => HISTORY.pushMobile(return_path), 200);
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

import { LogoutIcon } from "lantern-icons";

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

const settings_selector = createStructuredSelector({
    active_tab: (state: RootState) => state.history.parts[1],
    use_mobile_view: (state: RootState) => state.window.use_mobile_view,
});

const SettingsTabs = React.memo(({ do_return }: ISettingsTabsProps) => {
    let { active_tab, use_mobile_view } = useSelector(settings_selector),
        tab = TABS.find(tab => tab.path == active_tab) || TABS[0],
        TabComponent = tab.comp,
        dispatch = useDispatch(),
        do_logout = () => dispatch(logout());

    let needs_categories = true, needs_page = true;

    if(use_mobile_view) {
        needs_categories = !active_tab;
        needs_page = !needs_categories;
    }

    let categories, page;

    if(needs_categories) {
        categories = (
            <div className="ln-settings__categories">
                <h3>Settings</h3>

                <ul>
                    {TABS.map(({ name, path }) => {
                        let selected = tab.path == path;
                        if(use_mobile_view && !active_tab) {
                            selected = false;
                        }

                        return (
                            <li key={name} className={(selected ? 'selected' : '')}>
                                <Link href={`/settings/${path}`} title={name}> <div><span>{name}</span></div> </Link>
                            </li>
                        );
                    })}

                    <div className="spacer" />

                    <hr />

                    <li>
                        <div id="logout" onClick={do_logout} title="Logout">
                            <span>Logout</span>
                            <div>
                                <VectorIcon src={LogoutIcon} />
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
        );
    }

    if(needs_page) {
        page = (
            <div className="ln-settings__page">
                <div className="ln-settings__header">
                    {use_mobile_view && <div onClick={() => HISTORY.back()}><span>Settings</span></div>}
                    <h3>{tab.name}</h3>
                    <div onClick={do_return}><span>Return</span></div>
                </div>

                <div className="ln-settings__content">
                    <TabComponent />
                </div>
            </div>
        );
    } else {
        page = (
            <div className="ln-settings__page">
                <div className="ln-settings__content">
                    Select any category to view settings
                </div>
            </div>
        );
    }

    return (
        <>
            {categories}
            {page}
        </>
    );
});
