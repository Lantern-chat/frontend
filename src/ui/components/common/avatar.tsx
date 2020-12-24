import React from "react";

import "./styles/avatar.scss";

export interface TagProps {
    rounded?: boolean,
    url: string,
    username: string,
}

export default class Avatar extends React.PureComponent<TagProps> {
    render() {
        let cn = "avatar-image";
        if(this.props.rounded === true) { cn += " rounded"; }

        return (
            <div className="avatar">
                <img src={this.props.url} className={cn} alt={this.props.username} />
            </div>
        );
    }
}