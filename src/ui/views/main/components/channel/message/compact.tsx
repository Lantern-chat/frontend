import { For, Show } from "solid-js";
import { useRootSelector } from "state/root";
import { selectCachedUserFromMessage } from "state/selectors/selectCachedUser";
import { useI18nContext } from "ui/i18n/i18n-solid";
import { formatters } from "ui/i18n";
import { MsgAttachment } from "./attachment";
import { IMessageProps, MessageUserName } from "./common";

import { Message as MessageBody } from "./msg";
import { Reactions } from "./reaction";

export function CompactMessage(props: IMessageProps) {
    let { LL, locale } = useI18nContext(), f = () => formatters[locale()];

    let cached_member = useRootSelector(state => selectCachedUserFromMessage(state, props.msg.msg));

    let extra = () => {
        if(props.msg.et) {
            return (
                <span class="ui-text ln-system-sub" title={LL().main.EDITED_ON({ ts: props.msg.et })}>
                    ({LL().main.EDITED().toLocaleLowerCase(locale())})
                </span>
            );
        }
        return;
    };

    return (
        <div class="ln-msg--compact" classList={{ 'no-text': !props.msg.msg.content }}>
            <div class="ln-msg__title">

                <div class="ln-msg__side">
                    <div class="ln-msg__sidets" title={f().timestamp(props.msg.ts) as string}>
                        <span class="ui-text" textContent={f().time(props.msg.ts) as string} />
                    </div>
                </div>

                <MessageUserName name={cached_member().nick} user={props.msg.msg.author} party_id={props.msg.msg.party_id} />
            </div>

            <MessageBody msg={props.msg.msg} extra={extra()} />

            <For each={props.msg.msg.attachments}>
                {attachment => <MsgAttachment msg={props.msg.msg} attachment={attachment} />}
            </For>

            <Show when={props.msg.msg.reactions?.length}>
                <Reactions msg={props.msg.msg} />
            </Show>
        </div>
    );
}