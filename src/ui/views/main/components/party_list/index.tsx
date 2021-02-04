import React, { useContext } from "react";
import { fetch, XHRMethod } from "client/fetch";
import { fnv1a } from "client/fnv";

import { Avatar } from "ui/components/common/avatar";
import { Glyphicon } from "ui/components/common/glyphicon";

import { Session } from "client/session";

import LogoutIcon from "icons/glyphicons-pro/glyphicons-basic-2-4/svg/individual-svg/glyphicons-basic-432-log-out.svg";


import "./party_list.scss";
import { Tooltip } from "ui/components/common/tooltip";
export const PartyList = React.memo(() => {
    let ctx = useContext(Session);

    let session = ctx.session!;

    let logout = () => {
        ctx.setSession(null)

        fetch({
            url: "/api/v1/user/logout",
            method: XHRMethod.DELETE,
            headers: { 'Authorization': 'Bearer ' + session.auth }
        }).catch(() => { })
    };


    let dummy_data = ['A', 'B', 'C', 'D'];
    let colors = ['yellow', 'lightblue', 'lightgreen', 'lightcoral'];

    for(let i = 0; i < 25; i++) {
        dummy_data.push("party-" + i);
    }

    return (
        <div className="ln-party-list-wrapper">
            <ul className="ln-party-list ln-vertical-scroll ln-vertical-scroll--rtl ln-scroll-fixed">
                {dummy_data.map((text, i) => (
                    <li key={i}>
                        <Avatar rounded url={`https://placekitten.com/${(i % 25) + 50}/${(i % 25) + 50}`} username={text} backgroundColor={colors[fnv1a(text) % colors.length]}></Avatar>
                    </li>
                ))}
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