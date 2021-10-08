import React, { useCallback, useEffect, useMemo, useState } from "react";

import { IMessageState } from "state/reducers/chat";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "state/root";

import { Glyphicon } from "ui/components/common/glyphicon";

import { ContextMenu } from "./list";

import PencilIcon from "icons/glyphicons-pro/glyphicons-halflings-2-3/svg/individual-svg/glyphicons-halflings-13-pencil.svg";
import TrashIcon from "icons/glyphicons-pro/glyphicons-basic-2-4/svg/individual-svg/glyphicons-basic-17-bin.svg";
import TrashOpenIcon from "icons/glyphicons-pro/custom/glyphicons-basic-17b-bin-open.svg";
import ClipboardIcon from "icons/glyphicons-pro/glyphicons-basic-2-4/svg/individual-svg/glyphicons-basic-30-clipboard.svg";
import CopyIcon from "icons/glyphicons-pro/glyphicons-basic-2-4/svg/individual-svg/glyphicons-basic-614-copy.svg";
import ChatMessageIcon from "icons/glyphicons-pro/glyphicons-halflings-2-3/svg/individual-svg/glyphicons-halflings-135-chat-message.svg";
import TriangleIcon from "icons/glyphicons-pro/glyphicons-halflings-2-3/svg/individual-svg/glyphicons-halflings-42-triangle-alert.svg";

export interface IMsgContextMenuProps {
    msg: IMessageState,
    pos: any,
    onConfirmChange: (pending: boolean) => void,
}

function copyText(txt: string): Promise<void> {
    return navigator.clipboard.writeText(txt);
}

/// Menu shown when right-clicking on a message in chat
import "./msg_context.scss";
import { deleteMessage } from "state/commands/message/delete";
export const MsgContextMenu = React.memo(({ msg, pos, onConfirmChange }: IMsgContextMenuProps) => {
    let dev_mode = useSelector((state: RootState) => state.prefs.dev_mode);

    let [shownConfirmation, setShownConfirmation] = useState(false);

    // if context menu changes position, remove the dialogue
    useEffect(() => setShownConfirmation(false), [pos]);
    useEffect(() => onConfirmChange(shownConfirmation), [shownConfirmation]);

    let copy_msg = useCallback(() => copyText(msg.msg.content), [msg.msg.content]);
    let copy_id = useCallback(() => copyText(msg.msg.id), [msg.msg.id]);

    // it's fine to memoize this since any attempts to select more would trigger a click event and close the context menu
    let selected = useMemo(() => {
        let selection = window.getSelection(),
            msg_list = document.getElementById("ln-msg-list");

        if(selection && msg_list && msg_list.contains(selection.anchorNode)) {
            let selected = selection.toString();
            if(selected.length > 0) return selected;
        }

        return;
    }, []);

    let copy_selection = useCallback(() => selected && copyText(selected), [selected]);

    let dispatch = useDispatch();

    let on_delete = useMemo(() => {
        var timer: number | null = null, delayed = false;

        return (e: React.MouseEvent) => {
            if(timer === null) {
                timer = setTimeout(() => { delayed = true; }, 120);
                setShownConfirmation(true);
                e.stopPropagation();
            }

            if(delayed) {
                dispatch(deleteMessage(msg.msg.room_id, msg.msg.id));
                // Do delete
            } else {
                e.stopPropagation();
            }
        };
    }, [pos, msg]);

    return (
        <ContextMenu>
            {
                !selected ? null : (
                    <>
                        <div onClick={copy_selection}>
                            <Glyphicon src={ClipboardIcon} />
                            <span className="ui-text">Copy Selection</span>
                        </div>

                        <hr />
                    </>
                )
            }

            <div>
                <Glyphicon src={PencilIcon} />
                <span className="ui-text">Edit Message</span>
            </div>

            <div onClick={copy_msg}>
                <Glyphicon src={CopyIcon} />
                <span className="ui-text">Copy Message</span>
            </div>

            <hr />

            <div>
                <Glyphicon src={TriangleIcon} />
                <span className="ui-text">Report Message</span>
            </div>

            <div className={shownConfirmation ? 'ln-contextmenu-confirm' : 'ln-contextmenu-delete'} onClick={on_delete}>
                {shownConfirmation ? <Glyphicon src={TrashOpenIcon} /> : <Glyphicon src={TrashIcon} />}
                <span className="ui-text">
                    {shownConfirmation ? "Are you sure?" : "Delete Message"}
                </span>
            </div>

            {
                dev_mode && (
                    <>
                        <hr />

                        <div onClick={copy_id}>
                            <Glyphicon src={ChatMessageIcon} />
                            <span className="ui-text">Copy ID</span>
                        </div>
                    </>
                )
            }
        </ContextMenu>
    )
});

if(__DEV__) {
    MsgContextMenu.displayName = "MsgContextMenu";
}