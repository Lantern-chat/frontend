import { Component, createEffect, createMemo, createSelector, createSignal, For, lazy, onCleanup, onMount, Show, Suspense, useContext } from "solid-js";
import { useStructuredSelector } from "solid-mutant";

import { useI18nContext } from "ui/i18n/i18n-solid";

import { ReadRootState, useRootDispatch, useRootSelector } from "state/root";
import { HISTORY } from "state/global";
import { activeParty, activeRoom } from "state/selectors/active";
import { room_url } from "config/urls";

import { Link } from "ui/components/history";
import { FullscreenModal, Modal } from "ui/components/modal";
import { Ripple } from "ui/components/common/spinners/ripple";
import { VectorIcon } from "ui/components/common/icon";

const Fallback = () => <div class="ln-center-standalone"><Ripple size={120} /></div>;

import "../modal.scss";
import "./settings.scss";
import "./tabs/_tab.scss";

import { ServerSettingsTab } from "./tabs/party-settings/server";
import { RolesSettingsTab } from "./tabs/party-settings/roles";
import { EmojiSettingsTab } from "./tabs/party-settings/emoji";
import { StickersSettingsTab } from "./tabs/party-settings/stickers";
import { MembersSettingsTab } from "./tabs/party-settings/members";

import { NamespaceMainTranslation } from "ui/i18n/i18n-types";

interface TabMap {
    n: keyof Pick<NamespaceMainTranslation['settings'],
        | 'SERVER'
        | 'ROLES'
        | 'EMOJI'
        | 'STICKERS'
        | 'MEMBERS'
    >,
    p: string,
    c: Component,
}

const TABS: Array<TabMap> = [
    { n: 'SERVER', p: 'server', c: ServerSettingsTab },
    { n: 'ROLES', p: 'roles', c: RolesSettingsTab },
    { n: 'EMOJI', p: 'emoji', c: EmojiSettingsTab },
    { n: 'STICKERS', p: 'stickers', c: StickersSettingsTab },
    { n: 'MEMBERS', p: 'members', c: MembersSettingsTab },
];

interface IpartySettingsProps {
    use_mobile_view: boolean,
    closePartySettings: () => void,
}

export function PartySettings(props: IpartySettingsProps) {
    let [closing, setClosing] = createSignal(false);
    let [active_tab, setActiveTab] = createSignal<TabMap['p']>('server');
    let { LL } = useI18nContext();
    // let return_path = useRootSelector(state => room_url(activeParty(state) || '@me', activeRoom(state)));

    let do_return = () => {
        if(!closing()) {
            setClosing(true);
            // setTimeout(() => HISTORY.pm(return_path()), 200);
        }
    };

    onMount(() => {
        let listener = (e: KeyboardEvent) => { if(e.key == 'Escape') { do_return(); } };
        window.addEventListener('keyup', listener);
        onCleanup(() => window.removeEventListener('keyup', listener));
    });
    let tab = createMemo(() => TABS.find(tab => tab.p == active_tab()) || TABS[0]);

    let is_tab_selected = createSelector(() => tab().p);
    createEffect(() => console.log(tab()))


    return (
        <FullscreenModal>
            <div class={"ln-modal ln-settings ln-settings--" + (closing() ? 'closing' : 'opened')}>
                <Show when={!props.use_mobile_view || !active_tab}>
                    <div class="ln-settings__categories">
                        <h3>{LL().main.SETTINGS()}</h3>

                        <ul class="ln-scroll-y">
                            <For each={TABS}>
                                {({ n, p }) => {
                                    let name = createMemo(() => LL().main.settings[n]());

                                    return (
                                        <li classList={{ 'selected': is_tab_selected(p) && !props.use_mobile_view && !!active_tab }} onClick={() => setActiveTab(p)}>
                                            <div><span>{name()}</span></div> 
                                        </li>
                                    );
                                }}
                            </For>

                            <div class="spacer" />

                            <hr />

                            {/* <li>
                                <div id="logout" onClick={do_logout} title="Logout">
                                    <span textContent={LL().main.settings.LOGOUT()} />
                                    <div>
                                        <VectorIcon id={Icons.Logout} />
                                    </div>
                                </div>
                            </li> */}
                        </ul>
                    </div>
                </Show>

                <Show when={!props.use_mobile_view || !!active_tab} fallback={<FallbackPage />}>
                    <div class="ln-settings__page">
                        <div class="ln-settings__header">

                            <h3>{LL().main.settings[tab().n]()}</h3>

                            <div onClick={props.closePartySettings}>
                                <span textContent={LL().main.settings.RETURN()} />
                            </div>
                        </div>

                        <div class="ln-settings__content">
                            <Dynamic component={tab().c} />
                        </div>
                    </div>
                </Show>
            </div>
        </FullscreenModal>
    )
}



import { logout } from "state/commands/session";
import { Dynamic } from "solid-js/web";
import { Icons } from "lantern-icons";

// function SettingsTabs(props: ISettingsTabsProps) {
//     // let { LL } = useI18nContext();

//     // let state = useStructuredSelector({
//     //     active_tab: (state: ReadRootState) => '',
//     //     use_mobile_view: (state: ReadRootState) => state.window.use_mobile_view,
//     // });

//     // let tab = createMemo(() => TABS.find(tab => tab.p == state.active_tab) || TABS[0]);

//     // let dispatch = useRootDispatch(),
//     //     do_logout = () => dispatch(logout());

//     // let is_tab_selected = createSelector(() => tab().p);
//     return(<span>hi</span>)

    
// }

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