import { Icons } from "lantern-icons";
import { createSignal, Show } from "solid-js";
import { VectorIcon } from "ui/components/common/icon";
import { TimeProvider } from "ui/hooks/createTimestamp";
import { MainContext } from "ui/hooks/useMain";
import { PartySettings } from "ui/views/main/modals/settings/party-settings";
import { ContextMenu } from "../../menus/list";

export interface IPartyOptionsDropdownProps {
    use_mobile_view: boolean,
    showPartySettings: () => void,
}

import "./dropdown.scss";
export function PartyOptionsDropdown(props: IPartyOptionsDropdownProps) {
    return (
        <div class="ln-party-header__dropdown"
        >
            <ContextMenu dark>
                <div onClick={() => props.showPartySettings()}>
                    <VectorIcon id={Icons.Cogwheel} />
                    Server Settings
                    
                </div>

                {/* <div>
                    <VectorIcon id={Icons.Balloon} />
                    Another
                </div> */}
            </ContextMenu>
        </div>
    )
}