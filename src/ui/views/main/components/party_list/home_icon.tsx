import { Avatar } from "ui/components/common/avatar";
import { VectorIcon } from "ui/components/common/icon";
import { Link } from "ui/components/history";

import { Icons } from "lantern-icons";

export interface IHomeProps {
    active_party: string | undefined,
    can_navigate: boolean,
}

export function Home(props: IHomeProps) {
    let ref: HTMLLIElement | undefined;

    return (
        <li id="user-home" class={"@me" == props.active_party ? "selected" : ""} ref={ref}>
            <Link title="Home" href="/channels/@me" >
                <Avatar rounded username="Home">
                    <VectorIcon id={Icons.Home} />
                </Avatar>
            </Link>
        </li>
    )
}