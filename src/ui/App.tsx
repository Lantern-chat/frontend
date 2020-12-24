import React from "react";

import "./styles/root.scss";

import Avatar from "./components/common/avatar";

import { Translation } from "./i18n";

export interface AppProps { }

export default class App extends React.Component<AppProps> {
    render() {
        return (<Translation lang="en">Test_Avatar</Translation>);
    }
}
