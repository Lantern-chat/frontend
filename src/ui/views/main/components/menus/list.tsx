import { For, JSX, children } from "solid-js";

export interface IContextMenuProps {
    children: JSX.Element,
    dark?: boolean,
    style?: JSX.CSSProperties,
}

import "./list.scss";
export function ContextMenu(props: IContextMenuProps) {
    let items = children(() => props.children);

    return (
        <ul class="ln-contextmenu ln-cm-pos" classList={{ dark: props.dark }} style={props.style}>
            <For each={items.toArray()}>{item => <li>{item}</li>}</For>
        </ul>
    );
}