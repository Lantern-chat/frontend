import { createEffect, createSignal, Show } from "solid-js";
import { ShowBool } from "ui/components/flow";

import { copyText } from "lib/clipboard";

import { useI18nContext } from "ui/i18n/i18n-solid";
import { useRootDispatch } from "state/root";
import { deleteMessage } from "state/commands/message/delete";
import { IMessageState } from "state/mutators/chat";
import { usePrefs } from "state/contexts/prefs";

import { VectorIcon } from "ui/components/common/icon";
import { UIText } from "ui/components/common/ui-text";

import { ContextMenu } from "./list";

import { Icons } from "lantern-icons";

export interface IMsgContextMenuProps {
    msg: IMessageState,
    pos: any,
    onConfirmChange: (pending: boolean) => void,
}

/// Menu shown when right-clicking on a message in chat
import "./msg_context.scss";
export function MsgContextMenu(props: IMsgContextMenuProps) {
    let dev_mode = usePrefs().DeveloperMode;

    let [shownConfirmation, setShownConfirmation] = createSignal(false);

    let { LL } = useI18nContext();

    // if context menu changes position, remove the dialogue
    createEffect(() => (props.pos, setShownConfirmation(false)));
    createEffect(() => props.onConfirmChange(shownConfirmation()));

    let copy_msg = () => props.msg.msg.content && copyText(props.msg.msg.content);

    // it's fine to memoize this since any attempts to select more would trigger a click event and close the context menu
    let selected: string | undefined;
    let selection = window.getSelection(),
        msg_list = document.getElementById("ln-msg-list");

    if(selection && msg_list && msg_list.contains(selection.anchorNode)) {
        selected = selection.toString();
    }

    let copy_selection = () => selected && copyText(selected);

    let dispatch = useRootDispatch();

    var timer: number | null = null, delayed = false;

    let on_delete = (e: MouseEvent) => {
        if(timer === null) {
            timer = setTimeout(() => { delayed = true; }, 120);
            setShownConfirmation(true);
            e.stopPropagation();
        }

        if(delayed) {
            dispatch(deleteMessage(props.msg.msg.room_id, props.msg.msg.id));
            // Do delete
        } else {
            e.stopPropagation();
        }
    };

    return (
        <ContextMenu>
            <ShowBool when={!!selected}>
                <div onClick={copy_selection}>
                    <VectorIcon id={Icons.Clipboard} />
                    <UIText text={LL().main.menus.msg.COPY_SEL()} />
                </div>

                <hr />
            </ShowBool>

            <div>
                <VectorIcon id={Icons.Pencil} /> <UIText text={LL().main.menus.msg.EDIT()} />
            </div>

            <div onClick={copy_msg}>
                <VectorIcon id={Icons.Copy} /> <UIText text={LL().main.menus.msg.COPY()} />
            </div>

            <hr />

            <div>
                <VectorIcon id={Icons.TriangleAlert} /> <UIText text={LL().main.menus.msg.REPORT()} />
            </div>

            <div onClick={on_delete}
                classList={{
                    "ln-contextmenu-confirm": shownConfirmation(),
                    "ln-contextmenu-delete": !shownConfirmation(),
                }}
            >
                <VectorIcon id={shownConfirmation() ? Icons.TrashOpen : Icons.Trash} />

                <UIText text={shownConfirmation() ? LL().main.menus.msg.CONFIRM() : LL().main.menus.msg.DELETE()} />
            </div>

            <ShowBool when={dev_mode()}>
                <hr />

                <div onClick={() => copyText(props.msg.msg.id)}>
                    <VectorIcon id={Icons.ChatMessage} />
                    <UIText text={LL().main.menus.COPY_ID()} />
                </div>
            </ShowBool>
        </ContextMenu>
    )
}
