import { MessageFlags, user_is_bot } from "state/models";
import { Icons } from "lantern-icons";
import { For, Show } from "solid-js";

import { useRootSelector } from "state/root";
import { selectCachedUserFromMessage } from "state/selectors/selectCachedUser";
import { VectorIcon } from "ui/components/common/icon";
import { Branch } from "ui/components/flow";
import { BotLabel } from "../../misc/bot_label";
import { IMessageProps, MessageUserAvatar, MessageUserName } from "./common";

import { Message as MessageBody } from "./msg";
import { MsgAttachment } from "./attachment";
import { createTimestamp } from "ui/hooks/createTimestamp";
import { UICalendar, UITimestamp } from "ui/components/common/timestamp";
import { useI18nContext } from "ui/i18n/i18n-solid";
import { Reactions } from "./reaction";

export function CozyMessage(props: IMessageProps) {
    let { LL, locale } = useI18nContext();

    let cached_member = useRootSelector(state => selectCachedUserFromMessage(state, props.msg.msg));

    let ts = createTimestamp(() => props.msg.ts);
    let ets = createTimestamp(() => props.msg.et);

    let extra = () => {
        if(!props.msg.sg && props.msg.et) {
            return <span class="ui-text ln-system-sub" title={LL().main.EDITED_ON({ ts: ets() })}>
                ({LL().main.EDITED().toLocaleLowerCase(locale())})
            </span>;
        }
        return;
    };

    return (
        <>
            <div class="ln-msg__side">
                <Branch>
                    <Branch.If when={props.msg.sg}>
                        {/*if first message in the group, give it the user avatar and title*/}
                        <MessageUserAvatar user={cached_member().user} name={cached_member().nick} party_id={props.msg.msg.party_id} />
                    </Branch.If>

                    <Branch.Else>
                        <div class="ln-msg__sidets" title={ts()}>
                            <UITimestamp time={props.msg.ts} format="LT" />
                        </div>
                    </Branch.Else>
                </Branch>
            </div>

            <div class="ln-msg__message">
                <Show when={props.msg.sg}>
                    <div class="ln-msg__title">
                        <MessageUserName name={cached_member().nick} user={props.msg.msg.author} party_id={props.msg.msg.party_id} />

                        <span class="ln-separator"> - </span>

                        <span class="ln-msg__ts" title={ts()}>
                            <UICalendar time={props.msg.ts} />

                            <Show when={props.msg.et}>
                                <span class="flags" title={LL().main.EDITED_ON({ ts: ets() })}>
                                    <VectorIcon id={Icons.Pencil} />
                                </span>
                            </Show>

                            <Show when={props.msg.msg.flags & MessageFlags.Pinned}>
                                <span class="flags" title={LL().main.MESSAGE_PINNED()}>
                                    <VectorIcon id={Icons.PushPin} />
                                </span>
                            </Show>
                        </span>

                        <Show when={user_is_bot(props.msg.msg.author)}>
                            <BotLabel />
                        </Show>
                    </div>
                </Show>

                <MessageBody msg={props.msg.msg} extra={extra()} />

                <Show when={props.msg.msg.reactions?.length}>
                    <Reactions msg={props.msg.msg} />
                </Show>

                <For each={props.msg.msg.attachments}>
                    {attachment => <MsgAttachment msg={props.msg.msg} attachment={attachment} />}
                </For>
            </div>
        </>
    );
}