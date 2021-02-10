import React, { useContext } from "react";
import { fetch, XHRMethod } from "client/fetch";
import { fnv1a } from "client/fnv";

import { Avatar } from "ui/components/common/avatar";
import { Glyphicon } from "ui/components/common/glyphicon";

import { Session } from "client/session";

import LogoutIcon from "icons/glyphicons-pro/glyphicons-basic-2-4/svg/individual-svg/glyphicons-basic-432-log-out.svg";


import "./party_list.scss";
import { useDispatch } from "react-redux";
export const PartyList = React.memo(() => {
    let ctx = useContext(Session);
    let dispatch = useDispatch();

    let logout = () => {
        ctx.setSession(null)

        fetch({
            url: "/api/v1/user/logout",
            method: XHRMethod.DELETE,
            headers: { 'Authorization': 'Bearer ' + ctx.session!.auth }
        }).catch(() => { })
    };

    let dummy_data = ['A', 'B', 'C', 'D'];
    let colors = ['yellow', 'lightblue', 'lightgreen', 'lightcoral'];

    for(let i = 0; i < 4; i++) {
        dummy_data.push("party-" + i);
    }

    return (
        <div className="ln-party-list__wrapper">
            <ul className="ln-party-list ln-scroll-y ln-scroll-y--invisible ln-scroll-fixed">
                {dummy_data.map((text, i) => (
                    <li key={i} className={i == 0 ? 'selected' : undefined}>
                        <Avatar rounded url={`https://placekitten.com/${(i % 25) + 50}/${(i % 25) + 50}`}
                            username={text} title={text} backgroundColor={colors[fnv1a(text) % colors.length]} />
                    </li>
                ))}

                <li id="create-party">
                    <Avatar rounded text="+" username="Join/Create Party" title="Join/Create Party"
                        onClick={() => dispatch({ type: 'MODAL_OPEN_CREATE_PARTY' })} />
                </li>
            </ul>

            <div id="logout" onClick={logout} title="Logout">
                <Glyphicon src={LogoutIcon} />
            </div>
        </div>
    );
});
if(process.env.NODE_ENV !== 'production') {
    PartyList.displayName = "PartyList";
}