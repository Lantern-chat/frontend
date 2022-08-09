import { For } from "solid-js";
import { useRootSelector } from "state/root";
import { selectCachedUserFromMessage } from "state/selectors/selectCachedUser";
import { UITimestamp } from "ui/components/common/timestamp";
import { createTimestamp } from "ui/hooks/createTimestamp";
import { useI18nContext } from "ui/i18n/i18n-solid";
import { MsgAttachment } from "./attachment";
import { IMessageProps, MessageUserName } from "./common";

import { Message as MessageBody } from "./msg";

export function CompactMessage(props: IMessageProps) {
    let { LL, locale } = useI18nContext();

    let cached_member = useRootSelector(state => selectCachedUserFromMessage(state, props.msg.msg));

    let ts = createTimestamp(() => props.msg.ts);

    let extra = () => {
        if(props.msg.et) {
            let ets = createTimestamp(() => props.msg.et);

            return (
                <span class="ui-text ln-system-sub" title={LL().main.EDITED_ON({ ts: ets() })}>
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
                    <div class="ln-msg__sidets" title={ts()}>
                        <UITimestamp time={props.msg.ts} format="LT" />
                    </div>
                </div>

                <MessageUserName name={cached_member().nick} user={props.msg.msg.author} party_id={props.msg.msg.party_id} />
            </div>

            <MessageBody msg={props.msg.msg} extra={extra()} />

            <For each={props.msg.msg.attachments}>
                {attachment => <MsgAttachment msg={props.msg.msg} attachment={attachment} />}
            </For>
        </div>
    );
}