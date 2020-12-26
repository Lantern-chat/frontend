import React from "react";

import { i18n, Translation as T } from "../i18n";

export default class MainView extends React.Component {
    render() {
        return (
            <>
                {i18n(T.CHANNEL)}
            </>
        );
    }
}