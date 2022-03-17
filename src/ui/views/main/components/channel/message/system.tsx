import dayjs from "dayjs";
import { ArrowThinRightIcon } from "lantern-icons";
import { VectorIcon } from "ui/components/common/icon";
import { IMessageProps } from "./common";

import { Message as MessageBody } from "./msg";

export function SystemMessage(props: IMessageProps) {
    return (
        <>
            <div className="ln-msg__side ln-system-message">
                <VectorIcon src={ArrowThinRightIcon} />
            </div>

            <div className="ln-msg__message ln-system-message">
                <MessageBody msg={props.msg.msg} extra={<sub>{dayjs(props.msg.ts).calendar()}</sub>} />
            </div>
        </>
    );
}