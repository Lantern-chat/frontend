import { User } from "state/models";
import { usePrefs } from "state/contexts/prefs";
import { asset_url } from "config/urls";
import { pickColorFromHash } from "lib/palette";
import type { IMessageState } from "state/mutators/chat";
import { useRootSelector, useRootStore } from "state/root";
import { activeParty } from "state/selectors/active";
import { Avatar } from "ui/components/common/avatar";
import { UIText } from "ui/components/common/ui-text";
import { AnchoredModal } from "ui/components/modal/anchored";
import { createSimpleToggleOnClick } from "ui/hooks/useMain";
import { UserCard } from "../../menus/user_card";

export interface IMessageProps {
    msg: DeepReadonly<IMessageState>,
}


interface IUserNameProps {
    name: string,
    user: DeepReadonly<User>,
}

export function MessageUserName(props: IUserNameProps) {
    let user = props.user,
        [show, main_click_props] = createSimpleToggleOnClick();

    let color = useRootSelector(state => {
        let party_id = activeParty(state);
        if(!party_id) return;

        let party = state.party.parties[party_id];
        if(!party) return;

        let color = party.member_colors[user.id];
        if(color == null) return;
        return formatRgbBinary(adjustUserColor(color)());
    });

    return (
        <h2 class="ln-msg__username" {...main_click_props} style={{ color: color() }}>
            <AnchoredModal show={show()}>
                <UserCard user={user} />
            </AnchoredModal>

            <UIText text={props.name} />
        </h2>
    );
}

export function MessageUserAvatar(props: Omit<IUserNameProps, 'msg'>) {
    let [show, main_click_props] = createSimpleToggleOnClick();
    let prefs = usePrefs();

    let avatar_url = () => props.user.profile?.avatar;

    return (
        <Avatar
            username={props.name}
            text={props.name.charAt(0)}
            url={avatar_url() && asset_url('user', props.user.id, avatar_url()!, 'avatar', prefs.LowBandwidthMode())}
            backgroundColor={pickColorFromHash(props.user.id, prefs.LightMode())}
            props={main_click_props}
            anchor={
                <AnchoredModal show={show()}>
                    <UserCard user={props.user} />
                </AnchoredModal>
            }
        />
    );
}