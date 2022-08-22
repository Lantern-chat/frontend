import { Show } from "solid-js";

import { copyText } from "lib/clipboard";

import { useRootDispatch } from "state/root";
import { activateParty } from "state/commands";
import { Party, Snowflake } from "state/models";
import { useI18nContext } from "ui/i18n/i18n-solid";
import { usePrefs } from "state/contexts/prefs";

import { pickColorFromHash } from "lib/palette";

import { Link } from "ui/components/history";
import { Avatar } from "ui/components/common/avatar";
import { PositionedModal } from "ui/components/modal/positioned";
import { UIText } from "ui/components/common/ui-text";

import { createSimplePositionedContextMenu } from "ui/hooks/useMain";

import { ContextMenu } from "../menus/list";

import { asset_url, room_url } from "config/urls";

interface IPartyAvatarProps {
    party: Party,
    last_channel: Record<Snowflake, Snowflake>,
    can_navigate: boolean,
    is_active?: boolean,
    active_party?: Snowflake,
}

export function PartyAvatar(props: IPartyAvatarProps) {
    let dispatch = useRootDispatch();
    let prefs = usePrefs();

    let last = () => props.last_channel[props.party.id],
        url = () => props.party.avatar ? asset_url('party', props.party.id, props.party.avatar, 'avatar', prefs.LowBandwidthMode()) : void 0,
        should_navigate = () => props.can_navigate && props.party.id != props.active_party;

    let on_navigate = () => { should_navigate() && dispatch(activateParty(props.party.id, last())) };

    let [pos, main_click_props] = createSimplePositionedContextMenu();

    return (
        <li classList={{ 'selected': props.is_active }} {...main_click_props}
            data-party-name={props.party.name}
        >
            <Link noAction href={room_url(props.party.id, last())} onNavigate={on_navigate}>
                <Avatar rounded url={url()} text={props.party.name.charAt(0)}
                    username={props.party.name} wrapper={{ title: props.party.name }}
                    backgroundColor={pickColorFromHash(props.party.id, prefs.LightMode())} />
            </Link>

            <Show when={pos()}>
                {pos => (
                    <PositionedModal rect={pos}>
                        <ListedPartyMenu party={props.party} />
                    </PositionedModal>
                )}
            </Show>
        </li>
    );
}

interface IListedPartyMenuProps {
    party: Party,
}

function ListedPartyMenu(props: IListedPartyMenuProps) {
    let dev_mode = usePrefs().DeveloperMode;;

    let { LL } = useI18nContext();

    return (
        <ContextMenu dark>
            <div>
                <UIText text={LL().main.menus.MARK_AS_READ()} />
            </div>

            <hr />

            <div>
                <UIText text={LL().main.menus.INVITE_PEOPLE()} />
            </div>

            <Show when={dev_mode()}>
                <hr />

                <div onClick={() => copyText(props.party.id)}>
                    <UIText text={LL().main.menus.COPY_ID()} />
                </div>
            </Show>
        </ContextMenu>
    );
}