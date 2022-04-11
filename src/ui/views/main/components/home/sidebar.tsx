import { Link } from "ui/components/history";
import { VectorIcon } from "ui/components/common/icon";

import { Icons } from "lantern-icons";

import "./sidebar.scss";
export function HomeSideBar() {
    return (
        <div className="ln-home-sidebar">
            <ul className="ln-home-tabs">
                <li>
                    <Link href="/channels/@me/friends">
                        <VectorIcon id={Icons.Family} />
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
}