import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { copyText } from "lib/clipboard";

import { UserPreferenceFlags } from "state/models";
import { deleteMessage } from "state/commands/message/delete";
import { IMessageState } from "state/reducers/chat";
import { selectPrefsFlag } from "state/selectors/prefs";

import { VectorIcon } from "ui/components/common/icon";

import { ContextMenu } from "./list";

import { PencilIcon } from "lantern-icons";
import { TrashIcon } from "lantern-icons";
import { TrashOpenIcon } from "lantern-icons";
import { ClipboardIcon } from "lantern-icons";
import { CopyIcon } from "lantern-icons";
import { ChatMessageIcon } from "lantern-icons";
import { TriangleIcon } from "lantern-icons";

export interface IMsgContextMenuProps {
    msg: IMessageState,
    pos: any,
    onConfirmChange: (pending: boolean) => void,
}

/// Menu shown when right-clicking on a message in chat
import "./msg_context.scss";
export const MsgContextMenu = React.memo(({ msg, pos, onConfirmChange }: IMsgContextMenuProps) => {
    let dev_mode = useSelector(selectPrefsFlag(UserPreferenceFlags.DeveloperMode));

    let [shownConfirmation, setShownConfirmation] = useState(false);

    // if context menu changes position, remove the dialogue
    useEffect(() => setShownConfirmation(false), [pos]);
    useEffect(() => onConfirmChange(shownConfirmation), [shownConfirmation]);

    let copy_msg = useCallback(() => msg.msg.content && copyText(msg.msg.content), [msg.msg.content]);

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
                            <VectorIcon src={ClipboardIcon} />
                            <span className="ui-text">Copy Selection</span>
                        </div>

                        <hr />
                    </>
                )
            }

            <div>
                <VectorIcon src={PencilIcon} />
                <span className="ui-text">Edit Message</span>
            </div>

            <div onClick={copy_msg}>
                <VectorIcon src={CopyIcon} />
                <span className="ui-text">Copy Message</span>
            </div>

            <hr />

            <div>
                <VectorIcon src={TriangleIcon} />
                <span className="ui-text">Report Message</span>
            </div>

            <div className={shownConfirmation ? 'ln-contextmenu-confirm' : 'ln-contextmenu-delete'} onClick={on_delete}>
                {shownConfirmation ? <VectorIcon src={TrashOpenIcon} /> : <VectorIcon src={TrashIcon} />}
                <span className="ui-text">
                    {shownConfirmation ? "Are you sure?" : "Delete Message"}
                </span>
            </div>

            {
                dev_mode && (
                    <>
                        <hr />

                        <div onClick={() => copyText(msg.msg.id)}>
                            <VectorIcon src={ChatMessageIcon} />
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