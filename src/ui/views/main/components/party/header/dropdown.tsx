import { Icons } from "lantern-icons";
import { VectorIcon } from "ui/components/common/icon";
import { ContextMenu } from "../../menus/list";

export interface IPartyOptionsDropdownProps {

}

import "./dropdown.scss";
export function PartyOptionsDropdown(props: IPartyOptionsDropdownProps) {
    return (
        <div class="ln-party-header__dropdown"
        >
            <ContextMenu dark>
                <div>
                    <VectorIcon id={Icons.Balloon} />
                    Thing
                </div>

                <div>
                    <VectorIcon id={Icons.Balloon} />
                    Another
                </div>
            </ContextMenu>
        </div>
    )
}