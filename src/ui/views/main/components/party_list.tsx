import React, { useContext } from "react";
import { useParams } from "react-router";
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


    let dispatch = useDispatch();

    let { create_party_open, parties, sorted_parties } = useSelector((state: RootState) => ({
        parties: state.party.parties,
        sorted_parties: state.party.sorted,
        create_party_open: state.modals.create_party_open
    }));

    let { party: active_party } = useParams<{ party: string }>();

    let logout = () => {
        ctx.setSession(null)

        fetch({
            url: "/api/v1/user/@me",
            method: XHRMethod.DELETE,
            headers: { 'Authorization': 'Bearer ' + ctx.session!.auth }
        }).catch(() => { })
    };

    let colors = ['yellow', 'lightblue', 'lightgreen', 'lightcoral'];

    return (
        <div className="ln-party-list__wrapper">
            <ol className="ln-party-list ln-scroll-y ln-scroll-y--invisible ln-scroll-fixed">
                {Array.from(parties.values(), (party, i) => (
                    <li value={party.sort_order} key={party.id}
                        className={party.id == active_party ? 'selected' : undefined}>
                        <Avatar rounded url={`https://placekitten.com/${(i % 25) + 50}/${(i % 25) + 50}`}
                            username={party.name} title={party.name} backgroundColor={colors[fnv1a(party.id) % colors.length]} />
                    </li>
                ))}

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
if(process.env.NODE_ENV !== 'production') {
    PartyList.displayName = "PartyList";
}