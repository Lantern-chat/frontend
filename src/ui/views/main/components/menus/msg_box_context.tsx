import React, { useCallback, useMemo, useState } from "react";

import { IMessageState } from "state/reducers/chat";
import { useSelector } from "react-redux";
import { RootState } from "state/root";

import { VectorIcon } from "ui/components/common/icon";

import { ContextMenu } from "./list";

import { PasteIcon } from "ui/assets/icons";

export interface IMsgBoxContextMenuProps {
    on_paste: (text: string | null) => void,
}

function readClipboard(): Promise<string | null> {
    if(navigator.clipboard.readText != undefined) {
        return navigator.clipboard.readText();
    }

    console.log("Attempting old paste...");
    let text = null;
    try {
        let modals = document.body;
        let ta = document.createElement("textarea");
        modals.appendChild(ta);
        ta.focus();
        ta.focus();
        document.execCommand("paste");
        text = ta.textContent;
        modals.removeChild(ta);
    } catch(e) {
        console.error("Error pasting: ", e);
    }

    console.log("HERE: ", text);
    return Promise.resolve(text);
}

export const MsgBoxContextMenu = React.memo((props: IMsgBoxContextMenuProps) => {
    let on_paste = useCallback((e: React.MouseEvent) => {
        readClipboard().then((text: string) => props.on_paste(text));
        e.stopPropagation();
    }, [props.on_paste])

    return (
        <ContextMenu>
            <div onClick={on_paste}>
                <VectorIcon src={PasteIcon} />
                <span className="ui-text">Paste</span>
            </div>
        </ContextMenu>
    );
});