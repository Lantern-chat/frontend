import { createMemo, createSignal, For, Show } from "solid-js";
import { useStructuredSelector, useDispatch } from "solid-mutant";

import { RootState, Type, useRootSelector } from "state/root";
import { activeParty } from "state/selectors/active";
import { selectPrefsFlag } from "state/selectors/prefs";
import { themeSelector } from "state/selectors/theme";
import { GatewayStatus } from "state/mutators/gateway";

import { Avatar } from "ui/components/common/avatar";
import { Spinner } from "ui/components/common/spinners/spinner";

import { Home } from "./home_icon";
import { PartyAvatar } from "./party_avatar";

import { UserPreferenceFlags } from "state/models";

//function asTouchEvent(e: UIEvent): TouchEvent | undefined {
//    return (e as TouchEvent).targetTouches ? e as TouchEvent : undefined;
//}

const GATEWAY_PENDING = [GatewayStatus.Connecting, GatewayStatus.Waiting, GatewayStatus.Unknown];

import "./party_list.scss";
export function PartyList() {
    let [isScrolling, setIsScrolling] = createSignal(0);

    let state = useStructuredSelector({
        parties: (state: RootState) => Object.values(state.party.parties).map(party => party.party).sort((a, b) => a.position - b.position),
        is_light_theme: selectPrefsFlag(UserPreferenceFlags.LightMode),
        use_mobile_view: (state: RootState) => state.window.use_mobile_view,
        user_object: (state: RootState) => state.user.user,
        last_channel: (state: RootState) => state.party.last_channel,
        gateway_status: (state: RootState) => state.gateway.status,
        theme: themeSelector,
        active_party: activeParty,
    });

    // TODO: Figure this out, stop accidental navigation on mobile
    let can_navigate = createMemo(() => !state.use_mobile_view || isScrolling() < 2);

    let on_touchstart = () => state.use_mobile_view && setIsScrolling(isScrolling() + 1);
    let on_scroll = () => state.use_mobile_view && setIsScrolling(isScrolling() + 1);
    let on_touchend = () => state.use_mobile_view && setIsScrolling(0);

    return (
        <div className="ln-party-list__wrapper">
            <ol className="ln-party-list ln-scroll-y ln-scroll-y--invisible ln-scroll-fixed"
                onScroll={on_scroll} onTouchStart={on_touchstart} onTouchEnd={on_touchend}>

                <Home active_party={state.active_party} can_navigate={can_navigate()} />

                <Show when={state.user_object && !GATEWAY_PENDING.includes(state.gateway_status)} fallback={Connecting}>
                    <For each={state.parties}>
                        {party => <PartyAvatar
                            party={party} last_channel={state.last_channel}
                            can_navigate={can_navigate()}
                            active_party={state.active_party}
                            is_light_theme={state.is_light_theme}
                        />}
                    </For>

                    <CreateParty can_navigate={can_navigate()} />
                </Show>
            </ol>
        </div>
    );
}

function Connecting() {
    return (
        <li id="connecting">
            <div className="ln-center-standalone">
                <Spinner size="2em" />
            </div>
        </li>
    )
}

function CreateParty(props: { can_navigate: boolean }) {
    let dispatch = useDispatch();

    let create_party_open = useRootSelector(state => state.modals.create_party_open);

    return (
        <li id="create-party" className={create_party_open() ? 'selected' : ''}>
            <Avatar rounded text="+" username="Join/Create a Party"
                wrapper={{
                    title: "Join/Create a Party",
                    onClick: () => props.can_navigate && dispatch({ type: Type.MODAL_OPEN_CREATE_PARTY })
                }}
            />
        </li>
    )
}