import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createSelector, createStructuredSelector } from "reselect";

import { RootState, Type } from "state/root";
import { activateParty } from "state/commands";
import { activeParty } from "state/selectors/active";
import { GatewayStatus } from "state/reducers/gateway";

import { pickColorFromHash } from "lib/palette";

import { Link } from "ui/components/history";
import { Avatar } from "ui/components/common/avatar";
import { Spinner } from "ui/components/common/spinners/spinner";

import { room_url } from "config/urls";

let sorted_party_selector = createSelector((state: RootState) => state.party.parties, parties => {
    // this really just copies references into an array, so it should be fast
    let party_array = Array.from(parties.values(), party => party.party);
    party_array.sort((a, b) => a.sort_order - b.sort_order);
    return party_array;
});

let party_list_selector = createStructuredSelector({
    parties: sorted_party_selector,
    is_light_theme: (state: RootState) => state.prefs.light,
    use_mobile_view: (state: RootState) => state.window.use_mobile_view,
    user_object: (state: RootState) => state.user.user,
    last_channel: (state: RootState) => state.party.last_channel,
    create_party_open: (state: RootState) => state.modals.create_party_open,
    gateway_status: (state: RootState) => state.gateway.status,
    active_party: activeParty,
});

function asTouchEvent(e: React.UIEvent<HTMLElement>): React.TouchEvent<HTMLElement> | undefined {
    let et = e as React.TouchEvent<HTMLElement>;
    return et.targetTouches ? et : undefined;
}

import "./party_list.scss";
export const PartyList = React.memo(() => {
    // TODO: Setting isScrolling will re-render, rewrite this to not do that
    let [isScrolling, setIsScrolling] = useState(0);

    let {
        create_party_open,
        is_light_theme,
        use_mobile_view,
        user_object,
        parties,
        last_channel,
        active_party,
        gateway_status
    } = useSelector(party_list_selector);

    let dispatch = useDispatch();

    const GATEWAY_PENDING = [GatewayStatus.Connecting, GatewayStatus.Waiting, GatewayStatus.Unknown];

    let on_scroll, on_touchstart, on_touchend, can_navigate = true;
    if(use_mobile_view) {
        on_touchstart = () => setIsScrolling(isScrolling + 1);
        on_scroll = () => setIsScrolling(isScrolling + 1);
        on_touchend = () => setIsScrolling(0);

        can_navigate = isScrolling < 2;
    }

    let party_list;
    if(user_object && !GATEWAY_PENDING.includes(gateway_status)) {
        party_list = parties.map(party => {
            let last = last_channel.get(party.id),
                url = party.icon_id && `/avatars/${party.id}/${party.icon_id}`,
                do_navigate = can_navigate && party.id != active_party;

            return (
                <li key={party.id}
                    className={party.id == active_party ? 'selected' : ''}>
                    <Link noAction href={room_url(party.id, last)} onNavigate={(e) => do_navigate && dispatch(activateParty(party.id, last))}>
                        <Avatar rounded url={url} text={party.name.charAt(0)}
                            username={party.name} span={{ title: party.name }} backgroundColor={pickColorFromHash(party.id, is_light_theme)} />
                    </Link>
                </li>
            );
        });
    } else {
        party_list = (
            <li id="connecting">
                <div className="ln-center-standalone">
                    <Spinner size="2em" />
                </div>
            </li>
        );
    }

    return (
        <div className="ln-party-list__wrapper">
            <ol className="ln-party-list ln-scroll-y ln-scroll-y--invisible ln-scroll-fixed"
                onScroll={on_scroll} onTouchStart={on_touchstart} onTouchEnd={on_touchend}>
                <li id="user-home" className={'@me' == active_party ? 'selected' : ''}>
                    <Link href="/channels/@me" onNavigate={e => ('@me' != active_party && can_navigate) || e.preventDefault()} >
                        <Avatar rounded text="@" username="Home" span={{ title: "Home" }} />
                    </Link>
                </li>

                {party_list}

                <li id="create-party" className={create_party_open ? 'selected' : ''}>
                    <Avatar rounded text="+" username="Join/Create a Party"
                        span={{ title: "Join/Create a Party", onClick: () => can_navigate && dispatch({ type: Type.MODAL_OPEN_CREATE_PARTY }) }}
                    />
                </li>
            </ol>
        </div>
    );
});
if(__DEV__) {
    PartyList.displayName = "PartyList";
}