import React from "react";

import { Helmet } from "react-helmet";

export default class MainView extends React.Component {
    render() {
        return (
            <>
                <Helmet>
                    <title>Lantern Chat</title>
                </Helmet>
            </>
        );
    }
}