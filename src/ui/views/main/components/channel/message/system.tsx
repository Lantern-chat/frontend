import { createMemo } from "solid-js";
import dayjs from "dayjs";
import { ArrowThinRightIcon } from "lantern-icons";
import { VectorIcon } from "ui/components/common/icon";
import { IMessageProps } from "./common";

import { Message as MessageBody } from "./msg";
import { createCalendar, createTimestamp } from "ui/hooks/createTimestamp";

export function SystemMessage(props: IMessageProps) {
    let ts = createMemo(() => dayjs(props.msg.ts)),
        title = createTimestamp(ts),
        calendar = createCalendar(ts);

    return (
        <>
            <div className="ln-msg__side ln-system-message">
                <VectorIcon src={ArrowThinRightIcon} />
            </div>

            <div className="ln-msg__message ln-system-message">
                <MessageBody msg={props.msg.msg} extra={
                    <span className="ui-text ln-system-sub" title={title()} textContent={calendar()} />
                } />
            </div>
        </>
    );
}