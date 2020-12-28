import React from "react";

export interface TagProps {
    tag: string,
}

// TODO: Add tooltip
export class Tag extends React.PureComponent<TagProps> {
    render() {
        return (
            <span className="role-tag">{this.props.tag}</span>
        );
    }
}