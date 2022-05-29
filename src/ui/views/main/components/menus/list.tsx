import { For, JSX } from "solid-js";
import { useChildrenArray } from "ui/hooks/useChildrenArray";

export interface IContextMenuProps {
    children: JSX.Element,
    dark?: boolean,
    style?: JSX.CSSProperties,
}

function eat(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
}

import "./list.scss";
export function ContextMenu(props: IContextMenuProps) {
    let items = useChildrenArray(() => props.children);

    return (
        <ul class="ln-contextmenu ln-cm-pos" classList={{ dark: props.dark }} onContextMenu={eat} style={props.style}>
            <For each={items()}>{item => <li>{item}</li>}</For>
        </ul>
    );
}