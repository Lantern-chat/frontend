import React from "react";

import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
} from "react-router-dom";

import Avatar from "./components/common/avatar/avatar";

export interface AppProps { }

const Main = React.lazy(() => import(
    /* webpackChunkName: 'MainView' */
    /* webpackPrefetch: true */
    "./views/main"
));
const Login = React.lazy(() => import(/* webpackChunkName: 'LoginView' */ "./views/login"));
const Admin = React.lazy(() => import(/* webpackChunkName: 'AdminView' */ "./views/admin"));

export default class App extends React.Component<AppProps> {
    render() {
        return (
            <Router>
                <Switch>
                    <Route path="/">
                        <Main />
                    </Route>
                </Switch>
            </Router>
        );
    }
}
