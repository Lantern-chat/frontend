import dayjs from "dayjs";
import { createMemo, For } from "solid-js";
import { useSelector } from "solid-mutant";
import { RootState } from "state/root";
import { selectCachedUser } from "state/selectors/selectCachedUser";
import { MsgAttachment } from "./attachment";
import { IMessageProps, MessageUserName } from "./common";

import { Message as MessageBody } from "./msg";

export function CompactMessage(props: IMessageProps) {
    let cached_member = useSelector((state: RootState) => {
        return selectCachedUser(state, props.msg.msg.author.id, props.msg.msg.party_id)
            || { user: props.msg.msg.author, nick: props.msg.msg.member?.nick };
    });

    let ts = createMemo(() => dayjs(props.msg.ts).format("dddd, MMMM DD, h:mm A"));
    let ets = createMemo(() => props.msg.et && dayjs(props.msg.et).format("dddd, MMMM DD, h:mm A"));

    let nickname = createMemo(() => {
        let cached = cached_member();
        return cached.nick || cached.user.username;
    });

    let extra = createMemo(() => {
        if(props.msg.et) { return <span className="ui-text ln-system-sub" title={ets() as string}>(edited)</span>; }
        return;
    });

    return (
        <div className="ln-msg--compact" classList={{ 'no-text': !props.msg.msg.content }}>
            <div className="ln-msg__title">

                <div className="ln-msg__side">
                    <div className="ln-msg__sidets" title={ts()}>
                        <span className="ui-text">{dayjs(props.msg.ts).format('h:mm A')}</span>
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