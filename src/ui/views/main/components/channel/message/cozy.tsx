import { MessageFlags, user_is_bot } from "state/models";
import { Icons } from "lantern-icons";
import { For, Show } from "solid-js";

import { useRootSelector } from "state/root";
import { selectCachedUserFromMessage } from "state/selectors/selectCachedUser";
import { VectorIcon } from "ui/components/common/icon";
import { BotLabel } from "../../misc/bot_label";
import { IMessageProps, MessageUserAvatar, MessageUserName } from "./common";

import { Message as MessageBody } from "./msg";
import { MsgAttachment } from "./attachment";
import { UICalendar } from "ui/components/common/timestamp";
import { Reactions } from "./reaction";
import { useI18nContext } from "ui/i18n/i18n-solid";
import { formatters } from "ui/i18n";

export function CozyMessage(props: IMessageProps) {
    let { LL, locale } = useI18nContext(), f = () => formatters[locale()];

    let cached_member = useRootSelector(state => selectCachedUserFromMessage(state, props.msg.msg));

    let extra = () => {
        if(!props.msg.sg && props.msg.et) {
            return <span class="ui-text ln-system-sub" title={LL().main.EDITED_ON({ ts: props.msg.et })}>
                ({LL().main.EDITED().toLocaleLowerCase(locale())})
            </span>;
        }
        return;
    };

    return (
        <>
            <div class="ln-msg__side">
                {() => props.msg.sg ? (
                    // if first message in the group, give it the user avatar and title
                    <MessageUserAvatar user={cached_member().user} name={cached_member().nick} party_id={props.msg.msg.party_id} />
                ) : (
                    <div class="ln-msg__sidets" title={f().timestamp(props.msg.ts) as string}>
                        <span class="ui-text" textContent={f().time(props.msg.ts) as string} />
                    </div>
                )}
            </div>

            <div class="ln-msg__message">
                {/* Start of group */}
                {() => props.msg.sg && (
                    <div class="ln-msg__title">
                        <MessageUserName name={cached_member().nick} user={props.msg.msg.author} party_id={props.msg.msg.party_id} />

                        <span class="ln-separator"> - </span>

                        <span class="ln-msg__ts" title={f().timestamp(props.msg.ts) as string}>
                            <UICalendar time={props.msg.ts} />

                            {() => !!props.msg.et && (
                                <span class="flags" title={LL().main.EDITED_ON({ ts: props.msg.ts })}>
                                    <VectorIcon id={Icons.Pencil} />
                                </span>
                            )}

                            {() => (props.msg.msg.flags & MessageFlags.Pinned) != 0 && (
                                <span class="flags" title={LL().main.MESSAGE_PINNED()}>
                                    <VectorIcon id={Icons.PushPin} />
                                </span>
                            )}
                        </span>

                        {() => user_is_bot(props.msg.msg.author) && <BotLabel />}
                    </div>
                )}

                <MessageBody msg={props.msg.msg} extra={extra()} />

                <For each={props.msg.msg.attachments}>
                    {attachment => <MsgAttachment msg={props.msg.msg} attachment={attachment} />}
                </For>

                <Show when={props.msg.msg.reactions?.length}>
                    <Reactions msg={props.msg.msg} />
                </Show>
            </div>
        </>
    );
}