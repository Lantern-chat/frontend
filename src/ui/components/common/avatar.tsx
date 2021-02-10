import React from "react";

import "./avatar.scss";

export interface IAvatarProps {
    rounded?: boolean,
    url?: string,
    text?: string,
    title?: string,
    backgroundColor?: string,
    username: string,
    onClick?: (e: React.MouseEvent<HTMLSpanElement>) => void,
}

export const Avatar = React.memo((props: IAvatarProps) => (
    <div className={"ln-avatar" + (props.rounded ? " ln-rounded" : '')}>
        <span className="ln-avatar__wrapper" onClick={props.onClick} title={props.title}>
            {props.url != null ?
                <img src={props.url} className="ln-avatar__image" alt={props.username} /> :
                <span className="ln-avatar__text" style={{ backgroundColor: props.backgroundColor }}>{props.text || '?'}</span>}
        </span>
    </div>
));