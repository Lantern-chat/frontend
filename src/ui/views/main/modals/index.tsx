import { Dynamic } from "solid-js/web";

import { useRootSelector } from "state/root";

import { InviteModal } from "./invite";
import { SettingsModal } from "./settings";

export default function MainModals() {
    const path = useRootSelector(state => state.history.parts[0]);

    const comp = () => {
        switch(path()) {
            case "settings": return SettingsModal;
            case "invite": return InviteModal;
        }
        return;
    };

    return <Dynamic component={comp()} />;
}