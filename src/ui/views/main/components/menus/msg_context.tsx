import React, { useCallback, useMemo, useState } from "react";

import { IMessageState } from "state/reducers/chat";
import { useSelector } from "react-redux";
import { RootState } from "state/root";

import { Glyphicon } from "ui/components/common/glyphicon";

import { ContextMenu } from "./list";

import PencilIcon from "icons/glyphicons-pro/glyphicons-halflings-2-3/svg/individual-svg/glyphicons-halflings-13-pencil.svg";
import TrashIcon from "icons/glyphicons-pro/glyphicons-basic-2-4/svg/individual-svg/glyphicons-basic-17-bin.svg";
import ClipboardIcon from "icons/glyphicons-pro/glyphicons-basic-2-4/svg/individual-svg/glyphicons-basic-30-clipboard.svg";
import CopyIcon from "icons/glyphicons-pro/glyphicons-basic-2-4/svg/individual-svg/glyphicons-basic-614-copy.svg";
import ChatMessageIcon from "icons/glyphicons-pro/glyphicons-halflings-2-3/svg/individual-svg/glyphicons-halflings-135-chat-message.svg";
import TriangleIcon from "icons/glyphicons-pro/glyphicons-halflings-2-3/svg/individual-svg/glyphicons-halflings-42-triangle-alert.svg";

export interface IMsgContextMenuProps {
    msg: IMessageState,
}

function copyText(txt: string): Promise<void> {
    return navigator.clipboard.writeText(txt);
}

/// Menu shown when right-clicking on a message in chat
export const MsgContextMenu = React.memo(({ msg }: IMsgContextMenuProps) => {
    let copy_msg = useCallback(() => {
        copyText(msg.msg.content);
    }, [msg.msg.content]);

    let copy_id = useCallback(() => {
        copyText(msg.msg.id);
    }, [msg.msg.id]);

    // it's fine to memoize this since any attempts to select more would trigger a click event and close the context menu
    let selected = useMemo(() => {
        let selection = window.getSelection(),
            msg_list = document.getElementById("ln-msg-list");

        if(!selection || !msg_list || !msg_list.contains(selection.anchorNode)) return;

        let selected = selection.toString();
        if(selected.length == 0) return;

        return selected;
    }, []);

    let copy_selection = useCallback(() => {
        if(selected) {
            copyText(selected);
        }
    }, [selected]);

    let dev_mode = useSelector((state: RootState) => state.prefs.dev_mode);

    let [shownConfirmation, setShownConfirmation] = useState(false);

    let on_delete = (e: React.MouseEvent) => {
        if(shownConfirmation) {
            // TODO: Do delete
        } else {
            setShownConfirmation(true);
            e.stopPropagation();
        }
    };

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

            <div style={{ color: '#ff5555', fill: '#ff5555' }} onClick={on_delete}>
                <Glyphicon src={TrashIcon} />
                <span className="ui-text" style={{ textDecoration: shownConfirmation ? 'underline' : '' }}>
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