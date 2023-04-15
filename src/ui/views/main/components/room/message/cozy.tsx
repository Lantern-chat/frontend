import { MessageFlags, user_is_bot } from "state/models";
import { ShowBool } from "ui/components/flow";
import { Icons } from "lantern-icons";
import { Show } from "solid-js";

import { useRootSelector } from "state/root";
import { selectCachedUserFromMessage } from "state/selectors/selectCachedUser";
import { VectorIcon } from "ui/components/common/icon";
import { BotLabel } from "../../misc/bot_label";
import { IMessageProps, MessageUserAvatar, MessageUserName } from "./common";

import { Message as MessageBody } from "./msg";
import { Attachments } from "./attachment";
import { Embeds, should_hide_message } from "./embed";
import { UICalendar } from "ui/components/common/timestamp";
import { Reactions } from "./reaction";
import { useI18nContext } from "ui/i18n/i18n-solid";
import { formatters } from "ui/i18n";
import { usePrefs } from "state/contexts/prefs";
import { activeRoom } from "state/selectors/active";

export function CozyMessage(props: IMessageProps) {
    const prefs = usePrefs(), { LL, locale } = useI18nContext(), f = () => formatters[locale()];

    let cached_member = useRootSelector(state => selectCachedUserFromMessage(state, props.msg.msg));

    let extra = () => {
        if(!props.msg.sg && props.msg.et) {
            return <span class="ui-text ln-system-sub" title={LL().main.EDITED_ON({ ts: props.msg.et })}>
                ({LL().main.EDITED().toLocaleLowerCase(locale())})
            </span>;
        }
        return;
    };

    let room_flags = useRootSelector(state => {
        let active_room = activeRoom(state);
        if(active_room) {
            return state.chat.rooms[active_room]?.room.flags;
        }
        return;
    });

    return (
        <>
            <div class="ln-msg__side">
                <ShowBool when={!props.msg.sg} fallback={
                    // if first message in the group, give it the user avatar and title
                    <MessageUserAvatar user={cached_member().user} name={cached_member().nick} party_id={props.msg.msg.party_id} />
                }>
                    <div class="ln-msg__sidets" title={f().timestamp(props.msg.ts) as string}>
                        <span class="ui-text" textContent={f().time(props.msg.ts) as string} />
                    </div>
                </ShowBool>
            </div>

            <div class="ln-msg__message">
                {/* Start of group */}
                <Show when={props.msg.sg}>
                    <div class="ln-msg__title">
                        <MessageUserName name={cached_member().nick} user={props.msg.msg.author} party_id={props.msg.msg.party_id} />

                        <span class="ln-separator"> - </span>

                        <span class="ln-msg__ts" title={f().timestamp(props.msg.ts) as string}>
                            <UICalendar time={props.msg.ts} />

                            <Show when={props.msg.et}>
                                <span class="flags" title={LL().main.EDITED_ON({ ts: props.msg.et })}>
                                    <VectorIcon id={Icons.Pencil} />
                                </span>
                            </Show>

                            <Show when={props.msg.msg.pins?.length}>
                                <span class="flags" title={LL().main.MESSAGE_PINNED()}>
                                    <VectorIcon id={Icons.PushPin} />
                                </span>
                            </Show>

                            <ShowBool when={props.msg.msg.starred}>
                                <span class="flags" title={LL().main.MESSAGE_STARRED()}>
                                    <VectorIcon id={Icons.StarSmall} />
                                </span>
                            </ShowBool>
                        </span>

                        <ShowBool when={user_is_bot(props.msg.msg.author)}>
                            <BotLabel />
                        </ShowBool>
                    </div>
                </Show>

                <MessageBody msg={props.msg.msg} extra={extra()} hide={should_hide_message(props, prefs, room_flags)} />

                <Show when={!!props.msg.msg.attachments?.length}>
                    <Attachments msg={props.msg.msg} prefs={prefs} />
                </Show>

                <Show when={!!props.msg.msg.embeds?.length && !prefs.HideAllEmbeds()}>
                    <Embeds msg={props.msg.msg} room_flags={room_flags} prefs={prefs} />
                </Show>

                <Show when={!!props.msg.msg.reactions?.length}>
                    <Reactions msg={props.msg.msg} />
                </Show>
            </div>
        </>
    );
}