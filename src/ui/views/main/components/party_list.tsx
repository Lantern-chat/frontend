import React, { useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createSelector, createStructuredSelector } from "reselect";

import { fetch, XHRMethod } from "lib/fetch";
import { fnv1a } from "lib/fnv";

import { Link } from "ui/components/history";
import { Avatar } from "ui/components/common/avatar";
import { Glyphicon } from "ui/components/common/glyphicon";

import { RootState } from "state/root";
import { setSession } from "state/action_creators/session";

import LogoutIcon from "icons/glyphicons-pro/glyphicons-basic-2-4/svg/individual-svg/glyphicons-basic-432-log-out.svg";

let sorted_party_selector = createSelector((state: RootState) => state.party.parties, parties => {
    // this really just copies references into an array, so it should be fast
    let party_array = Array.from(parties.values());
    party_array.sort((a, b) => a.sort_order - b.sort_order);
    return party_array;
});

let party_list_selector = createStructuredSelector({
    parties: sorted_party_selector,
    last_channel: (state: RootState) => state.party.last_channel,
    create_party_open: (state: RootState) => state.modals.create_party_open,
    auth: (state: RootState) => state.user.session?.auth,
    active_party: (state: RootState) => state.history.parts[1] // /channels/:party_id/:channel_id
});

const Logout = () => {
    let auth = useSelector((state: RootState) => state.user.session!.auth);

    let dispatch = useDispatch();
    let logout = () => dispatch(
        fetch({
            url: "/api/v1/user/@me",
            method: XHRMethod.DELETE,
            headers: { 'Authorization': 'Bearer ' + auth }
        }).then(() => setSession(null))
    );

    return (
        <div id="logout" onClick={logout} title="Logout">
            <Glyphicon src={LogoutIcon} />
        </div>
    );
};

import "./party_list.scss";
export const PartyList = React.memo(() => {
    let { create_party_open, parties, last_channel, active_party } = useSelector(party_list_selector);
    let dispatch = useDispatch();

    let colors = ['goldenrod', 'royalblue', 'darkgreen', 'crimson'];

    return (
        <div className="ln-party-list__wrapper">
            <ol className="ln-party-list ln-scroll-y ln-scroll-y--invisible ln-scroll-fixed">
                <li id="user-home" className={'@me' == active_party ? 'selected' : ''}>
                    <Link href="/channels/@me">
                        <Avatar rounded text="@" username="Home" title="Home" />
                    </Link>
                </li>

                {parties.map((party, i) => {
                    let last = last_channel.get(party.id),
                        url = party.icon_id && `/avatars/${party.id}/${party.icon_id}`;

                    last = last ? '/' + last : '';

                    return (
                        <li key={party.id} className={party.id == active_party ? 'selected' : undefined}>
                            <Link href={`/channels/${party.id}${last}`}>
                                <Avatar rounded url={url} text={party.name.charAt(0)}
                                    username={party.name} title={party.name} backgroundColor={colors[fnv1a(party.id) % colors.length]} />
                            </Link>
                        </li>
                    );
                })}

                <li id="create-party" className={create_party_open ? 'selected' : ''}>
                    <Avatar rounded text="+" username="Join/Create a Party" title="Join/Create a Party"
                        onClick={() => dispatch({ type: 'MODAL_OPEN_CREATE_PARTY' })} />
                </li>
            </ol>

            <Logout />
        </div>
    );
});
if(__DEV__) {
    PartyList.displayName = "PartyList";
    Logout.displayName = "Logout";
}