import React from "react";

import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
} from "react-router-dom";

import Avatar from "ui/components/common/avatar/avatar";

export interface AppProps { }

const Main = React.lazy(() => import(
    /* webpackChunkName: 'MainView' */
    /* webpackPrefetch: true */
    "./views/main"
));
const Login = React.lazy(() => import(      /* webpackChunkName: 'LoginView'    */  "./views/login"));
const Register = React.lazy(() => import(   /* webpackChunkName: 'RegisterView' */  "./views/register/register"));
const Admin = React.lazy(() => import(      /* webpackChunkName: 'AdminView'    */  "./views/admin"));

export const App = (props: AppProps) => (
    <Router>
        <Switch>
            <Route path="/login">
                <Login />
            </Route>
            <Route path="/register">
                <Register />
            </Route>
            <Route path="/admin">
                <Admin />
            </Route>
            <Route path="/">
                <Main />
            </Route>
        </Switch>
    </Router>
);

export default App;