import React, { useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createSelector, createStructuredSelector } from "reselect";

import { RootState } from "state/root";
import { setSession, activateParty } from "state/commands";
import { GatewayStatus } from "state/reducers/gateway";

import { fetch, XHRMethod } from "lib/fetch";
import { pickColorFromHash } from "lib/palette";

import { Link } from "ui/components/history";
import { Avatar } from "ui/components/common/avatar";
import { Glyphicon } from "ui/components/common/glyphicon";
import { Spinner } from "ui/components/common/spinners/spinner";

import LogoutIcon from "icons/glyphicons-pro/glyphicons-basic-2-4/svg/individual-svg/glyphicons-basic-432-log-out.svg";

let sorted_party_selector = createSelector((state: RootState) => state.party.parties, parties => {
    // this really just copies references into an array, so it should be fast
    let party_array = Array.from(parties.values(), party => party.party);
    party_array.sort((a, b) => a.sort_order - b.sort_order);
    return party_array;
});

let party_list_selector = createStructuredSelector({
    parties: sorted_party_selector,
    is_light_theme: (state: RootState) => state.theme.is_light,
    user_object: (state: RootState) => state.user.user,
    auth: (state: RootState) => state.user.session!.auth,
    last_channel: (state: RootState) => state.party.last_channel,
    create_party_open: (state: RootState) => state.modals.create_party_open,
    gateway_status: (state: RootState) => state.gateway.status,
    active_party: (state: RootState) => state.history.parts[1] // /channels/:party_id/:channel_id
});

import "./party_list.scss";
export const PartyList = React.memo(() => {
    let { create_party_open, is_light_theme, user_object, parties, last_channel, auth, active_party, gateway_status } = useSelector(party_list_selector);

    let dispatch = useDispatch();

    let logout = () => dispatch(
        fetch({
            url: "/api/v1/user/@me",
            method: XHRMethod.DELETE,
            bearer: auth,
        }).then(() => setSession(null))
    );

    const GATEWAY_PENDING = [GatewayStatus.Connecting, GatewayStatus.Waiting, GatewayStatus.Unknown];

    let party_list;
    if(user_object && GATEWAY_PENDING.indexOf(gateway_status) == -1) {
        party_list = parties.map(party => {
            let last = last_channel.get(party.id),
                url = party.icon_id && `/avatars/${party.id}/${party.icon_id}`;
            last = last ? '/' + last : '';
            return (
                <li key={party.id}
                    className={party.id == active_party ? 'selected' : ''}>
                    <Link href={`/channels/${party.id}${last}`} onNavigate={() => dispatch(activateParty(party.id))}>
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
            <ol className="ln-party-list ln-scroll-y ln-scroll-y--invisible ln-scroll-fixed">
                <li id="user-home" className={'@me' == active_party ? 'selected' : ''}>
                    <Link href="/channels/@me">
                        <Avatar rounded text="@" username="Home" span={{ title: "Home" }} />
                    </Link>
                </li>

                {party_list}

                <li id="create-party" className={create_party_open ? 'selected' : ''}>
                    <Avatar rounded text="+" username="Join/Create a Party"
                        span={{ title: "Join/Create a Party", onClick: () => dispatch({ type: 'MODAL_OPEN_CREATE_PARTY' }) }}
                    />
                </li>
            </ol>

            <div id="logout" onClick={logout} title="Logout">
                <Glyphicon src={LogoutIcon} />
            </div>
        </div>
    );
});
if(__DEV__) {
    PartyList.displayName = "PartyList";
}