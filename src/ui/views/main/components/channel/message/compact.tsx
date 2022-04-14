import { createMemo, For } from "solid-js";
import { useSelector } from "solid-mutant";
import { ReadRootState } from "state/root";
import { selectCachedUser } from "state/selectors/selectCachedUser";
import { UITimestamp } from "ui/components/common/timestamp";
import { createTimestamp } from "ui/hooks/createTimestamp";
import { useI18nContext } from "ui/i18n/i18n-solid";
import { MsgAttachment } from "./attachment";
import { IMessageProps, MessageUserName } from "./common";

import { Message as MessageBody } from "./msg";

export function CompactMessage(props: IMessageProps) {
    let { LL, locale } = useI18nContext();

    let cached_member = useSelector((state: ReadRootState) => {
        return selectCachedUser(state, props.msg.msg.author.id, props.msg.msg.party_id)
            || { user: props.msg.msg.author, nick: props.msg.msg.member?.nick };
    });

    let ts = createTimestamp(() => props.msg.ts);
    let ets = createTimestamp(() => props.msg.et);

    let nickname = createMemo(() => {
        let cached = cached_member();
        return cached.nick || cached.user.username;
    });

    let edited = createMemo(() => LL().main.EDITED().toLocaleLowerCase(locale()));

    let extra = createMemo(() => {
        if(props.msg.et) {
            return (
                <span className="ui-text ln-system-sub" title={LL().main.EDITED_ON({ ts: ets() })}>
                    ({edited()})
                </span>
            );
        }
        return;
    });

    return (
        <div className="ln-msg--compact" classList={{ 'no-text': !props.msg.msg.content }}>
            <div className="ln-msg__title">

                <div className="ln-msg__side">
                    <div className="ln-msg__sidets" title={ts()}>
                        <UITimestamp time={props.msg.ts} format="LT" />
                    </div>
                </div>

                <MessageUserName name={nickname()} user={props.msg.msg.author} />
            </div>

            <MessageBody msg={props.msg.msg} extra={extra()} />

            <For each={props.msg.msg.attachments}>
                {attachment => <MsgAttachment msg={props.msg.msg} attachment={attachment} />}
            </For>
        </div>
    );
}