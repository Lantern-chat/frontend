import React from "react";
import { useDispatch } from "react-redux";
import { Glyphicon } from "ui/components/common/glyphicon";

import { Type } from "state/main";

import Menu from "icons/glyphicons-pro/glyphicons-basic-2-4/svg/individual-svg/glyphicons-basic-600-menu.svg";
import Users from "icons/glyphicons-pro/glyphicons-basic-2-4/svg/individual-svg/glyphicons-basic-321-users.svg";

import "./header.scss";
export const ChannelHeader = React.memo(() => {
    let dispatch = useDispatch();

    let on_click = () => dispatch({ type: Type.WINDOW_TOGGLE_RIGHT_SIDEBAR });

    return (
        <div className="ln-channel-header">
            <div className="ln-channel-header__hamburger" onClick={on_click}>
                <Glyphicon src={Menu} />
            </div>

            Channel Header

            <div className="ln-channel-header__users">
                <Glyphicon src={Users} />
            </div>
        </div>
    );
});