import React from "react";

export interface IContextMenuProps {
    children: React.ReactNodeArray | React.ReactNode,
    dark?: boolean,
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

    let classNames = "ln-contextmenu ln-cm-pos";
    if(props.dark) {
        classNames += " dark";
    }

    return (
        <ul className={classNames} onContextMenu={eat}>
            {(children as React.ReactNodeArray).map((child, i) => (<li key={i}>{child}</li>))}
        </ul>
    )
})