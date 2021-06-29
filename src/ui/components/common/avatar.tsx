import React from "react";

import "./avatar.scss";

export interface IAvatarProps {
    rounded?: boolean,
    url?: string,
    text?: string,
    backgroundColor?: string,
    username: string,
    span?: React.HTMLAttributes<HTMLSpanElement>,
}

export const Avatar = React.memo((props: IAvatarProps) => {
    let is_image = props.url != null,
        className = "ln-avatar" + (is_image ? '__image' : '__text');

    className = (props.rounded ? [className, className + "--rounded"] : [className]).join(' ');

    return (
        <div className="ln-avatar" >
            <span className="ln-avatar__wrapper" {...props.span}>
                {is_image ?
                    <img src={props.url} className={className} alt={props.username} /> :
                    <span className={className} style={{ backgroundColor: props.backgroundColor }}>{props.text || '?'}</span>}
            </span>
        </div>
    );
});