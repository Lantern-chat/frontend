import { MessageFlags, user_is_bot } from "state/models";
import dayjs from "dayjs";
import { PencilIcon, PushPinIcon } from "lantern-icons";
import { createMemo, Show } from "solid-js";
import { useSelector } from "solid-mutant";
import { RootState } from "state/root";
import { selectCachedUser } from "state/selectors/selectCachedUser";
import { VectorIcon } from "ui/components/common/icon";
import { Branch } from "ui/components/flow";
import { BotLabel } from "../../misc/bot_label";
import { IMessageProps, MessageUserAvatar, MessageUserName } from "./common";

import { Message as MessageBody } from "./msg";

export function CozyMessage(props: IMessageProps) {
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

    return (
        <>
            <div className="ln-msg__side">
                <Branch>
                    <Branch.If when={props.msg.sg}>
                        {/*if first message in the group, give it the user avatar and title*/}
                        <MessageUserAvatar user={cached_member().user} name={nickname()} is_light_theme={props.is_light_theme} />
                    </Branch.If>

                    <Branch.Else>
                        <div className="ln-msg__sidets" title={ts()}>
                            <span className="ui-text">{dayjs(props.msg.ts).format('h:mm A')}</span>
                        </div>
                    </Branch.Else>
                </Branch>
            </div>

            <div className="ln-msg__message">
                <Show when={props.msg.sg}>
                    <div className="ln-msg__title">
                        <MessageUserName name={nickname()} user={props.msg.msg.author} />

                        <span className="ln-separator"> - </span>

                        <span className="ln-msg__ts" title={ts()}>
                            <span className="ui-text">{dayjs(props.msg.ts).calendar()}</span>

                            <Show when={props.msg.et}>
                                <span className="flags" title={"Edited " + ets()}>
                                    <VectorIcon src={PencilIcon} />
                                </span>
                            </Show>

                            <Show when={props.msg.msg.flags & MessageFlags.Pinned}>
                                <span className="flags" title="Message Pinned">
                                    <VectorIcon src={PushPinIcon} />
                                </span>
                            </Show>
                        </span>

                        <Show when={user_is_bot(props.msg.msg.author)}>
                            <BotLabel />
                        </Show>
                    </div>
                </Show>

                <MessageBody msg={props.msg.msg} />

                {/*<For each={props.msg.msg.attachments}>
                    {attachment => <MsgAttachment key={attachment.id} msg={props.msg.msg} attachment={attachment} />}
                </For>*/}
            </div>
        </>
    );
}