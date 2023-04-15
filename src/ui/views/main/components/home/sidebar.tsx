import { Link } from "ui/components/history";
import { VectorIcon } from "ui/components/common/icon";

import { Icons } from "lantern-icons";

import "./sidebar.scss";
export function HomeSideBar() {
    return (
        <div class="ln-home-sidebar">
            <ul class="ln-home-tabs">
                <li>
                    <Link href="/rooms/@me">
                        <VectorIcon id={Icons.Friends} />
                        <span class="ui-text">Friends</span>
                    </Link>
                </li>
            </ul>

            <h4 id="dm-header">
                <span class="ui-text">Direct Messages</span>
            </h4>
        </div>
    );
}