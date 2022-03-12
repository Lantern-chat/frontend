import { children, createMemo, For, JSX } from "solid-js";

export interface IContextMenuProps {
    children: JSX.Element,
    dark?: boolean,
}

function eat(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
}

import "./list.scss";
export function ContextMenu(props: IContextMenuProps) {
    let maybe_items = children(() => props.children);

    let items = () => {
        let mi = maybe_items();
        return Array.isArray(mi) ? mi : [mi];
    };

    return (
        <ul className="ln-contextmenu ln-cm-pos" classList={{ dark: props.dark }} onContextMenu={eat}>
            <For each={items()}>{item => <li>{item}</li>}</For>
        </ul>
    );
}