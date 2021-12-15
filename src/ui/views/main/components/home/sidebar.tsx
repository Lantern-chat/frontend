import React from "react";

import { Link } from "ui/components/history";
import { Glyphicon } from "ui/components/common/glyphicon";

import FamilyIcon from "icons/glyphicons-pro/glyphicons-basic-2-4/svg/individual-svg/glyphicons-basic-532-user-family.svg";

import "./sidebar.scss";
export const HomeSideBar = React.memo(() => {
    return (
        <div className="ln-home-sidebar">
            <ul className="ln-home-tabs">
                <li>
                    <Link href="/channels/@me/friends">
                        <Glyphicon src={FamilyIcon} />
                        <span className="ui-text">Friends</span>
                    </Link>
                </li>
            </ul>

            <h4 id="dm-header">
                <span className="ui-text">Direct Messages</span>
            </h4>

            <ul>
                <li>You have no friends :(</li>
            </ul>


        </div>
    );
});

if(__DEV__) {
    HomeSideBar.displayName = "HomeSideBar";
}