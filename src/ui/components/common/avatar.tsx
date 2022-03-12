import { createMemo, JSX } from "solid-js";

import "./avatar.scss";

export interface IAvatarProps {
    rounded?: boolean,
    url?: string,
    text?: string,
    backgroundColor?: string,
    username: string,
    wrapper?: JSX.HTMLAttributes<HTMLDivElement>,
    children?: any,
    props?: JSX.HTMLAttributes<HTMLDivElement>,
    anchor?: any,
}

export function Avatar(props: IAvatarProps) {
    let className = createMemo(() => {
        let className = "ln-avatar" + (props.url != null ? '__image' : '__text');
        return (props.rounded ? [className, className + "--rounded"] : [className]).join(' ');
    });

    return (
        <div className="ln-avatar" {...props.props}>
            <div className="ln-avatar__wrapper" {...props.wrapper} title={props.username}>
                {props.url != null ?
                    <img src={props.url} className={className()} alt={props.username} /> :
                    <span className={className()} style={{ "background-color": props.backgroundColor }}>{props.children || props.text || '?'}</span>}
            </div>

            {props.anchor}
        </div>
    );
}