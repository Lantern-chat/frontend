import React from "react";

import "./styles/root.scss";

import Avatar from "./components/common/avatar";

import { I18N, Translation } from "./i18n";

export interface AppProps { }

export default class App extends React.Component<AppProps> {
    render() {
        return (<I18N lang="en" t={Translation.Test_Avatar} />);
    }
}
