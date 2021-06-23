import React, { useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createStructuredSelector } from "reselect";

import { fetch, XHRMethod } from "lib/fetch";
import { fnv1a } from "lib/fnv";

import { Link } from "ui/components/history";
import { Avatar } from "ui/components/common/avatar";
import { Glyphicon } from "ui/components/common/glyphicon";

import { RootState } from "state/root";
import { setSession } from "state/action_creators/session";

import LogoutIcon from "icons/glyphicons-pro/glyphicons-basic-2-4/svg/individual-svg/glyphicons-basic-432-log-out.svg";


let party_list_selector = createStructuredSelector({
    parties: (state: RootState) => state.party.parties,
    last_channel: (state: RootState) => state.party.last_channel,
    create_party_open: (state: RootState) => state.modals.create_party_open,
    auth: (state: RootState) => state.user.session?.auth,
});

import "./party_list.scss";
export const PartyList = React.memo(() => {
    let active_party = ""; //useRouteMatch<{ party: string }>("/channels/:party")?.params.party;

    let dispatch = useDispatch();
    let { create_party_open, parties, last_channel, auth } = useSelector(party_list_selector);

    let logout = () => {
        dispatch(
            fetch({
                url: "/api/v1/user/@me",
                method: XHRMethod.DELETE,
                headers: { 'Authorization': 'Bearer ' + auth }
            }).then(() => setSession(null))
        );
    };

    let colors = ['goldenrod', 'royalblue', 'darkgreen', 'crimson'];

    return (
        <div className="ln-party-list__wrapper">
            <ol className="ln-party-list ln-scroll-y ln-scroll-y--invisible ln-scroll-fixed">
                <li value={0} id="user-home" className={'@me' == active_party ? 'selected' : ''}>
                    <Link href="/channels/@me">
                        <Avatar rounded text="@" username="Home" title="Home" />
                    </Link>
                </li>

                {Array.from(parties.values(), (party, i) => {
                    let last = last_channel.get(party.id);
                    last = last ? '/' + last : '';
                    return (
                        <li value={1 + party.sort_order} key={party.id}
                            className={party.id == active_party ? 'selected' : undefined}>
                            <Link href={`/channels/${party.id}${last}`}>
                                <Avatar rounded url={true ? undefined : `https://placekitten.com/${(i % 25) + 50}/${(i % 25) + 50}`}
                                    text={party.name.charAt(0)}
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

            <div id="logout" onClick={logout} title="Logout">
                <Glyphicon src={LogoutIcon} />
            </div>
        </div>
    );
});
if(__DEV__) {
    PartyList.displayName = "PartyList";
}