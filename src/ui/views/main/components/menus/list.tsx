import React from "react";

export interface IContextMenuProps {
    children: React.ReactNodeArray,
}

import "./list.scss";
export const ContextMenu = React.memo((props: IContextMenuProps) => {
    return (
        <ul className="ln-contextmenu">
            {props.children.map((child, i) => (<li key={i}>{child}</li>))}
        </ul>
    )
})