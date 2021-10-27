import React from "react";
import classNames from "classnames";

export interface IContextMenuProps {
    children: React.ReactNodeArray | React.ReactNode,
    dark?: boolean,
}

function eat(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
}

import "./list.scss";
export const ContextMenu = React.memo(({ children, dark }: IContextMenuProps) => {
    if(!Array.isArray(children)) {
        children = [children];
    }

    let className = classNames("ln-contextmenu", "ln-cm-pos", { dark });

    return (
        <ul className={className} onContextMenu={eat}>
            {(children as React.ReactNodeArray).map((child, i) => (<li key={i}>{child}</li>))}
        </ul>
    )
})