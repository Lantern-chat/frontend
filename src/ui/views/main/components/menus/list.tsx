import React from "react";

export interface IContextMenuProps {
    children: React.ReactNodeArray | React.ReactNode,
}

function eat(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
}

import "./list.scss";
export const ContextMenu = React.memo((props: IContextMenuProps) => {
    let children = props.children;

    if(!Array.isArray(children)) {
        children = [children];
    }

    return (
        <ul className="ln-contextmenu ln-cm-pos" onContextMenu={eat}>
            {(children as React.ReactNodeArray).map((child, i) => (<li key={i}>{child}</li>))}
        </ul>
    )
})