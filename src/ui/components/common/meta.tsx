import React from "react";

export interface IMetaProps {
    name: string,
    content: string,
}

export class Meta extends React.PureComponent<IMetaProps> {
    e: HTMLMetaElement;

    constructor(props: IMetaProps) {
        super(props);
        this.e = document.createElement('meta');
    }



    componentDidMount() {
        document.head.appendChild(this.e);
    }

    componentWillUnmount() {
        document.head.removeChild(this.e);
    }

    render() {
        this.e.name = this.props.name;
        this.e.content = this.props.content;

        return <></>;
    }
}