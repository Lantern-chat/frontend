import React, { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createSelector, createStructuredSelector } from "reselect";

import { copyText } from "lib/clipboard";

import { RootState, Type } from "state/root";
import { activateParty } from "state/commands";
import { activeParty } from "state/selectors/active";
import { selectPrefsFlag } from "state/selectors/prefs";
import { GatewayStatus } from "state/reducers/gateway";

import { pickColorFromHash } from "lib/palette";

import { Link } from "ui/components/history";
import { Avatar } from "ui/components/common/avatar";
import { Glyphicon } from "ui/components/common/glyphicon";
import { Spinner } from "ui/components/common/spinners/spinner";
import { PositionedModal } from "ui/components/modal/positioned_modal";

import { useSimplePositionedContextMenu } from "ui/hooks/useMainClick";

import { ContextMenu } from "./menus/list";

import { party_avatar_url, room_url } from "config/urls";

import HomeIcon from "icons/glyphicons-pro/glyphicons-basic-2-4/svg/individual-svg/glyphicons-basic-21-home.svg";

let sorted_party_selector = createSelector((state: RootState) => state.party.parties, parties => {
    // this really just copies references into an array, so it should be fast
    let party_array = Array.from(parties.values(), party => party.party);
    party_array.sort((a, b) => a.position - b.position);
    return party_array;
});

import { Party, Snowflake, UserPreferenceFlags } from "state/models";

let party_list_selector = createStructuredSelector({
    parties: sorted_party_selector,
    is_light_theme: selectPrefsFlag(UserPreferenceFlags.LightMode),
    use_mobile_view: (state: RootState) => state.window.use_mobile_view,
    user_object: (state: RootState) => state.user.user,
    last_channel: (state: RootState) => state.party.last_channel,
    create_party_open: (state: RootState) => state.modals.create_party_open,
    gateway_status: (state: RootState) => state.gateway.status,
    active_party: activeParty,
});

function asTouchEvent(e: React.UIEvent<HTMLElement>): React.TouchEvent<HTMLElement> | undefined {
    let et = e as React.TouchEvent<HTMLElement>;
    return et.targetTouches ? et : undefined;
}

import "./party_list.scss";
export const PartyList = React.memo(() => {
    // TODO: Setting isScrolling will re-render, rewrite this to not do that
    let [isScrolling, setIsScrolling] = useState(0);

    let {
        create_party_open,
        is_light_theme,
        use_mobile_view,
        user_object,
        parties,
        last_channel,
        active_party,
        gateway_status
    } = useSelector(party_list_selector);

    let dispatch = useDispatch();

    const GATEWAY_PENDING = [GatewayStatus.Connecting, GatewayStatus.Waiting, GatewayStatus.Unknown];

    let on_scroll, on_touchstart, on_touchend, can_navigate = true;
    if(use_mobile_view) {
        on_touchstart = () => setIsScrolling(isScrolling + 1);
        on_scroll = () => setIsScrolling(isScrolling + 1);
        on_touchend = () => setIsScrolling(0);

        can_navigate = isScrolling < 2;
    }

    let party_list;
    if(user_object && !GATEWAY_PENDING.includes(gateway_status)) {
        party_list = parties.map(party => <PartyAvatar
            key={party.id}
            party={party} last_channel={last_channel}
            can_navigate={can_navigate}
            active_party={active_party}
            is_light_theme={is_light_theme}
        />);
    } else {
        party_list = (
            <li id="connecting">
                <div className="ln-center-standalone">
                    <Spinner size="2em" />
                </div>
            </li>
        );
    }

    return (
        <div className="ln-party-list__wrapper">
            <ol className="ln-party-list ln-scroll-y ln-scroll-y--invisible ln-scroll-fixed"
                onScroll={on_scroll} onTouchStart={on_touchstart} onTouchEnd={on_touchend}>
                <li id="user-home" className={'@me' == active_party ? 'selected' : ''}>
                    <Link title="Home" href="/channels/@me" onNavigate={e => ('@me' != active_party && can_navigate) || e.preventDefault()} >
                        <Avatar rounded username="Home">
                            <Glyphicon src={HomeIcon} />
                        </Avatar>
                    </Link>
                </li>

                {party_list}

                <li id="create-party" className={create_party_open ? 'selected' : ''}>
                    <Avatar rounded text="+" username="Join/Create a Party"
                        wrapper={{ title: "Join/Create a Party", onClick: () => can_navigate && dispatch({ type: Type.MODAL_OPEN_CREATE_PARTY }) }}
                    />
                </li>
            </ol>
        </div>
    );
});
if(__DEV__) {
    PartyList.displayName = "PartyList";
}

interface IPartyAvatarProps {
    party: Party,
    last_channel: Map<Snowflake, Snowflake>,
    can_navigate: boolean,
    active_party?: Snowflake,
    is_light_theme: boolean,
}

const PartyAvatar = React.memo((props: IPartyAvatarProps) => {
    let { party,
        last_channel,
        can_navigate,
        active_party,
        is_light_theme, } = props;

    let dispatch = useDispatch();

    let last = last_channel.get(party.id),
        url = party.avatar && party_avatar_url(party.id, party.avatar),
        do_navigate = can_navigate && party.id != active_party;

    let on_navigate = useCallback(() => { do_navigate && dispatch(activateParty(party.id, last)) }, [do_navigate, party.id, last]);

    let menu, [pos, main_click_props] = useSimplePositionedContextMenu();

    if(pos) {
        menu = (
            <PositionedModal {...pos}>
                <ListedPartyMenu party={props.party} />
            </PositionedModal>
        );
    }

    return (
        <li className={party.id == active_party ? 'selected' : ''} {...main_click_props}>

            <Link noAction href={room_url(party.id, last)} onNavigate={on_navigate}>
                <Avatar rounded url={url} text={party.name.charAt(0)}
                    username={party.name} wrapper={{ title: party.name }}
                    backgroundColor={pickColorFromHash(party.id, is_light_theme)} />
            </Link>

            {menu}
        </li>
    );
});

interface IListedPartyMenuProps {
    party: Party,
}

const ListedPartyMenu = React.memo((props: IListedPartyMenuProps) => {
    let dev_mode = useSelector(selectPrefsFlag(UserPreferenceFlags.DeveloperMode));

    return (
        <ContextMenu dark>
            <div>
                <span className="ui-text">Mark as Read</span>
            </div>

            <hr />

            <div>
                <span className="ui-text">Invite People</span>
            </div>
            {
                dev_mode && (
                    <>
                        <hr />
                        <div onClick={() => copyText(props.party.id)}>
                            <span className="ui-text">Copy ID</span>
                        </div>
                    </>
                )
            }
        </ContextMenu>
    )
})