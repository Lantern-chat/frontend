import React from "react";

export interface IContextMenuProps {
    children: React.ReactNodeArray | React.ReactNode,
}

import "./list.scss";
export const ContextMenu = React.memo((props: IContextMenuProps) => {
    let children = props.children;

    if(!Array.isArray(children)) {
        children = [children];
    }

    return (
        <ul className="ln-contextmenu ln-cm-pos">
            {(children as React.ReactNodeArray).map((child, i) => (<li key={i}>{child}</li>))}
        </ul>
    )
})