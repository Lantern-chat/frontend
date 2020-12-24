import React from "react";

import "./styles/root.scss";

import Avatar from "./components/common/avatar";

export interface AppProps { }

export default class App extends React.Component<AppProps> {
    render() {
        return (<Avatar url="test" username="Nova" />);
    }
}
