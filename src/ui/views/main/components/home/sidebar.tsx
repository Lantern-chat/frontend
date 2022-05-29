import { Link } from "ui/components/history";
import { VectorIcon } from "ui/components/common/icon";

import { Icons } from "lantern-icons";

import "./sidebar.scss";
export function HomeSideBar() {
    return (
        <div class="ln-home-sidebar">
            <ul class="ln-home-tabs">
                <li>
                    <Link href="/channels/@me/friends">
                        <VectorIcon id={Icons.Family} />
                        <span class="ui-text">Friends</span>
                    </Link>
                </li>
            </ul>

            <h4 id="dm-header">
                <span class="ui-text">Direct Messages</span>
            </h4>

            <ul>
                <li>You have no friends :(</li>
            </ul>
        </div>
    );
}