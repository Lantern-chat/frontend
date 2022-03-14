import { createMemo, createSelector, createSignal, For, onCleanup, onMount, Show } from "solid-js";
import { useDispatch, useStructuredSelector } from "solid-mutant";

import { RootState, useRootSelector } from "state/root";
import { HISTORY } from "state/global";
import { activeParty, activeRoom } from "state/selectors/active";
import { room_url } from "config/urls";

import { Link } from "ui/components/history";
import { Modal } from "ui/components/modal";
import { VectorIcon } from "ui/components/common/icon";

import "../modal.scss";
import "./settings.scss";
import "./tabs/_tab.scss";
export function SettingsModal() {
    let [closing, setClosing] = createSignal(false);

    let return_path = useRootSelector(state => room_url(activeParty(state) || '@me', activeRoom(state)));

    let do_return = () => {
        if(!closing()) {
            setClosing(true);
            setTimeout(() => HISTORY.pm(return_path()), 200);
        }
    };

    onMount(() => {
        let listener = (e: KeyboardEvent) => { if(e.key == 'Escape') { do_return(); } };
        window.addEventListener('keyup', listener);
        onCleanup(() => window.removeEventListener('keyup', listener));
    });

    return (
        <Modal>
            <div className={"ln-modal ln-settings ln-settings--" + (closing() ? 'closing' : 'opened')}>
                <SettingsTabs do_return={do_return} />
            </div>
        </Modal>
    )
}

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
import { Dynamic } from "solid-js/web";

function SettingsTabs(props: ISettingsTabsProps) {
    let state = useStructuredSelector({
        active_tab: (state: RootState) => state.history.parts[1],
        use_mobile_view: (state: RootState) => state.window.use_mobile_view,
    });

    let tab = createMemo(() => TABS.find(tab => tab.path == state.active_tab) || TABS[0]);

    let dispatch = useDispatch(),
        do_logout = () => dispatch(logout());

    let is_tab_selected = createSelector(() => tab().path);

    return (
        <>
            <Show when={!state.use_mobile_view || !state.active_tab}>
                <div className="ln-settings__categories">
                    <h3>Settings</h3>

                    <ul>
                        <For each={TABS}>
                            {({ name, path }) => (
                                <li classList={{ 'selected': is_tab_selected(path) && !state.use_mobile_view && !!state.active_tab }}>
                                    <Link href={`/settings/${path}`} title={name}> <div><span>{name}</span></div> </Link>
                                </li>
                            )}
                        </For>

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
            </Show>

            <Show when={!state.use_mobile_view || !!state.active_tab} fallback={<FallbackPage />}>
                <div className="ln-settings__page">
                    <div className="ln-settings__header">
                        <Show when={state.use_mobile_view}>
                            <Link href="/settings" useDiv><span>Settings</span></Link>
                        </Show>

                        <h3>{tab().name}</h3>

                        <div onClick={props.do_return}><span>Return</span></div>
                    </div>

                    <div className="ln-settings__content">
                        <Dynamic component={tab().comp} />
                    </div>
                </div>
            </Show>
        </>
    );
}

function FallbackPage() {
    return (
        <div className="ln-settings__page">
            <div className="ln-settings__content">
                Select any category to view settings
            </div>
        </div>
    );
}