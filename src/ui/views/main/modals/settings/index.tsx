import { Component, createMemo, createSelector, createSignal, For, lazy, onCleanup, onMount, Show, Suspense, useContext } from "solid-js";
import { useStructuredSelector } from "solid-mutant";

import { useI18nContext } from "ui/i18n/i18n-solid";

import { RootState, useRootDispatch, useRootSelector } from "state/root";
import { HISTORY } from "state/global";
import { activeParty, activeRoom } from "state/selectors/active";
import { room_url } from "config/urls";
import { MainContext } from "ui/hooks/useMain";

import { Link } from "ui/components/history";
import { Modal } from "ui/components/modal";
import { Ripple } from "ui/components/common/spinners/ripple";
import { VectorIcon } from "ui/components/common/icon";

const Fallback = () => <div class="ln-center-standalone"><Ripple size={120} /></div>;

import "../modal.scss";
import "./settings.scss";
import "./tabs/_tab.scss";
export function SettingsModal() {
    let [closing, setClosing] = createSignal(false);

    let return_path = useRootSelector(state => room_url(activeParty(state) || "@me", activeRoom(state)));

    let do_return = () => {
        if(!closing()) {
            setClosing(true);
            setTimeout(() => HISTORY.pm(return_path()), 200);
        }
    };

    onMount(() => {
        let listener = (e: KeyboardEvent) => { if(e.key == "Escape") { do_return(); } };
        window.addEventListener("keyup", listener);
        onCleanup(() => window.removeEventListener("keyup", listener));
    });

    return (
        <Modal class={"ln-modal ln-settings ln-settings--" + (closing() ? "closing" : "opened")}>
            <Suspense fallback={Fallback()}>
                <SettingsTabs do_return={do_return} />
            </Suspense>
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

import { NamespaceMainTranslation } from "ui/i18n/i18n-types";

interface TabMap {
    n: keyof Pick<NamespaceMainTranslation["settings"],
        | "ACCOUNT"
        | "PROFILE"
        | "PRIVACY"
        | "NOTIFICATIONS"
        | "APPEARANCE"
        | "ACCESSIBILITY"
        | "TEXT_AND_MEDIA"
        | "LANGUAGE"
    >,
    p: string,
    c: Component,
}

const TABS: Array<TabMap> = [
    { n: "ACCOUNT", p: "account", c: AccountSettingsTab },
    { n: "PROFILE", p: "profile", c: ProfileSettingsTab },
    { n: "PRIVACY", p: "privacy", c: PrivacySettingsTab },
    { n: "NOTIFICATIONS", p: "notifications", c: NotificationsSettingsTab },
    { n: "APPEARANCE", p: "appearance", c: AppearanceSettingsTab },
    { n: "ACCESSIBILITY", p: "accessibility", c: AccessibilitySettingsTab },
    { n: "TEXT_AND_MEDIA", p: "media", c: MediaSettingsTab },
    { n: "LANGUAGE", p: "language", c: LanguageSettingsTab },
];

interface ISettingsTabsProps {
    do_return: () => void,
}

import { logout } from "state/commands/session";
import { Dynamic } from "solid-js/web";
import { Icons } from "lantern-icons";

function SettingsTabs(props: ISettingsTabsProps) {
    let { LL } = useI18nContext();

    let state = useStructuredSelector({
        active_tab: (state: RootState) => state.history.parts[1],
        use_mobile_view: (state: RootState) => state.window.use_mobile_view,
    });

    let tab = createMemo(() => TABS.find(tab => tab.p == state.active_tab) || TABS[0]);

    let dispatch = useRootDispatch(),
        do_logout = () => dispatch(logout());

    let is_tab_selected = createSelector(() => tab().p);

    let main = useContext(MainContext);

    let on_click_return = async () => {
        if(!(await main.tryNav(undefined))) {
            return;
        }
        props.do_return();
    };

    return (
        <>
            <Show when={!state.use_mobile_view || !state.active_tab}>
                <div class="ln-settings__categories">
                    <h3>{LL().main.SETTINGS()}</h3>

                    <ul class="ln-scroll-y">
                        <For each={TABS}>
                            {({ n, p }) => {
                                let name = createMemo(() => LL().main.settings[n]());

                                return (
                                    <li classList={{ "selected": is_tab_selected(p) && !state.use_mobile_view && !!state.active_tab }}>
                                        <Link href={`/settings/${p}`} title={name()}> <div><span>{name()}</span></div> </Link>
                                    </li>
                                );
                            }}
                        </For>

                        <div class="spacer" />

                        <hr />

                        <li>
                            <div id="logout" onClick={do_logout} title="Logout">
                                <span textContent={LL().main.settings.LOGOUT()} />
                                <div>
                                    <VectorIcon id={Icons.Logout} />
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
            </Show>

            <Show when={!state.use_mobile_view || !!state.active_tab} fallback={<FallbackPage />}>
                <div class="ln-settings__page">
                    <div class="ln-settings__header">
                        <Show when={state.use_mobile_view}>
                            <Link href="/settings" useDiv><span>{LL().main.SETTINGS()}</span></Link>
                        </Show>

                        <h3>{LL().main.settings[tab().n]()}</h3>

                        <div onClick={on_click_return}>
                            <span textContent={LL().main.settings.RETURN()} />
                        </div>
                    </div>

                    <div class="ln-settings__content">
                        <Dynamic component={tab().c} />
                    </div>
                </div>
            </Show>
        </>
    );
}

function FallbackPage() {
    let { LL } = useI18nContext();

    return (
        <div class="ln-settings__page">
            <div class="ln-settings__content">
                {LL().main.settings.SELECT_CATEGORY()}
            </div>
        </div>
    );
}