import { Dynamic } from 'solid-js/web';

import { useRootSelector } from 'state/root';

import { InviteModal } from './invite';
import { SettingsModal } from './settings';

export default function MainModals() {
    let path = useRootSelector(state => state.history.parts[0]);

    let comp = () => {
        switch(path()) {
            case "settings": return SettingsModal;
            case "invite": return InviteModal;
        }
        return;
    };

    return <Dynamic component={comp()} />;
}