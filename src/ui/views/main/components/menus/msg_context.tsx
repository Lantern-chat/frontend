import React, { useCallback } from "react";

import { IMessageState } from "state/reducers/chat";

import { Glyphicon } from "ui/components/common/glyphicon";

import { ContextMenu } from "./list";

import PencilIcon from "icons/glyphicons-pro/glyphicons-halflings-2-3/svg/individual-svg/glyphicons-halflings-13-pencil.svg";
import TrashIcon from "icons/glyphicons-pro/glyphicons-basic-2-4/svg/individual-svg/glyphicons-basic-17-bin.svg";
import CopyIcon from "icons/glyphicons-pro/glyphicons-basic-2-4/svg/individual-svg/glyphicons-basic-614-copy.svg";

export const MsgContextMenu = React.memo(({ msg }: { msg: IMessageState }) => {
    let copy_msg = useCallback(() => {
        navigator.clipboard.writeText(msg.msg.content);
    }, [msg.msg.content]);

    return (
        <ContextMenu>
            <div>
                <Glyphicon src={PencilIcon} />
                <span>Edit Message</span>
            </div>

            <div onClick={copy_msg}>
                <Glyphicon src={CopyIcon} />
                <span>Copy Message</span>
            </div>

            <hr />

            <div style={{ color: '#ff5555', fill: '#ff5555' }}>
                <Glyphicon src={TrashIcon} />
                <span >Delete Message</span>
            </div>
        </ContextMenu>
    )
});