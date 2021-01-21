import React from "react";

import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
} from "react-router-dom";

import { Fireflies } from "ui/components/login/fireflies";
import Avatar from "ui/components/common/avatar/avatar";
import { Ripple } from "./components/common/spinners/spinners";
import { Logo } from "./components/common/logo";

export interface AppProps { }

const Main = React.lazy(() => import(
    /* webpackChunkName: 'MainView' */
    /* webpackPrefetch: true */
    "./views/main"
));
const Login = React.lazy(() => import(      /* webpackChunkName: 'LoginView'    */  "./views/login"));
const Register = React.lazy(() => import(   /* webpackChunkName: 'RegisterView' */  "./views/register"));
const Admin = React.lazy(() => import(      /* webpackChunkName: 'AdminView'    */  "./views/admin"));

const TestA = () => {
    console.log("TEST A");
    return <span />;
};

const TestB = () => {
    console.log("TEST B");
    return <span />;
};

export const App = (props: AppProps) => (
    <Router>
        <Switch>
            <Route path={["/login", "/register"]}>
                <Fireflies count={80} />
                <div className="ln-box">
                    <React.Suspense fallback={<div className="ln-center-standalone"><Ripple size={120} /></div>}>
                        <div className="ln-login-container ln-centered" style={{ zIndex: 1 }}>
                            <Route path="/login">
                                <TestA />
                                <Login />
                            </Route>
                            <Route path="/register">
                                <TestB />
                                <Register />
                            </Route>
                            <Logo />
                        </div>
                    </React.Suspense>
                </div>
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