import type { User } from "state/models";
import { user_avatar_url } from "config/urls";
import { pickColorFromHash } from "lib/palette";
import type { IMessageState } from "state/mutators/chat";
import { useRootSelector } from "state/root";
import { activeParty } from "state/selectors/active";
import { Avatar } from "ui/components/common/avatar";
import { UIText } from "ui/components/common/ui-text";
import { AnchoredModal } from "ui/components/modal/anchored";
import { createSimpleToggleOnClick } from "ui/hooks/useMain";
import { UserCard } from "../../menus/user_card";

export interface IMessageProps {
    msg: DeepReadonly<IMessageState>,
    is_light_theme: boolean,
    compact: boolean,
}


interface IUserNameProps {
    name: string,
    user: DeepReadonly<User>,
    is_light_theme?: boolean,
}

export function MessageUserName(props: IUserNameProps) {
    let user = props.user,
        [show, main_click_props] = createSimpleToggleOnClick();

    let color = useRootSelector(state => {
        let party_id = activeParty(state);
        if(!party_id) return;

        let party = state.party.parties[party_id];
        if(!party) return;

        return party.member_colors[user.id];
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

    let avatar_url;
    if(props.user.avatar) {
        avatar_url = user_avatar_url(props.user.id, props.user.avatar);
    }

    return (
        <Avatar
            username={props.name}
            text={props.name.charAt(0)}
            url={avatar_url}
            backgroundColor={pickColorFromHash(props.user.id, !!props.is_light_theme)}
            props={main_click_props}
            anchor={
                <AnchoredModal show={show()}>
                    <UserCard user={props.user} />
                </AnchoredModal>
            }
        />
    );
}