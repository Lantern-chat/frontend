import React, { useContext } from "react";
import { useParams, useRouteMatch } from "react-router";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { fetch, XHRMethod } from "lib/fetch";
import { fnv1a } from "lib/fnv";

import { Avatar } from "ui/components/common/avatar";
import { Glyphicon } from "ui/components/common/glyphicon";

import { Session } from "lib/session";
import { RootState } from "state/main";

import LogoutIcon from "icons/glyphicons-pro/glyphicons-basic-2-4/svg/individual-svg/glyphicons-basic-432-log-out.svg";


import "./party_list.scss";
export const PartyList = React.memo(() => {
    let ctx = useContext(Session);

    let active_party = useRouteMatch<{ party: string }>("/channels/:party")?.params.party;

    let dispatch = useDispatch();
    let { create_party_open, parties, last_channel } = useSelector((state: RootState) => ({
        parties: state.party.parties,
        last_channel: state.party.last_channel,
        //sorted_parties: state.party.sorted,
        create_party_open: state.modals.create_party_open
    }));

    let logout = () => {
        ctx.setSession(null)

        fetch({
            url: "/api/v1/user/@me",
            method: XHRMethod.DELETE,
            headers: { 'Authorization': 'Bearer ' + ctx.session!.auth }
        }).catch(() => { })
    };

    let colors = ['goldenrod', 'royalblue', 'darkgreen', 'crimson'];

    return (
        <div className="ln-party-list__wrapper">
            <ol className="ln-party-list ln-scroll-y ln-scroll-y--invisible ln-scroll-fixed">
                <li value={0} id="user-home" className={'@me' == active_party ? 'selected' : ''}>
                    <Link to="/channels/@me">
                        <Avatar rounded text="@" username="Home" title="Home" />
                    </Link>
                </li>

                {Array.from(parties.values(), (party, i) => {
                    let last = last_channel.get(party.id);
                    last = last ? '/' + last : '';
                    return (
                        <li value={1 + party.sort_order} key={party.id}
                            className={party.id == active_party ? 'selected' : undefined}>
                            <Link to={`/channels/${party.id}${last}`}>
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