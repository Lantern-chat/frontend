import React from "react";

import { BrowserRouter as Router, Route, Switch, Link } from "react-router-dom";

import { Fireflies } from "ui/components/login/fireflies";
import { ThemeWidget } from "ui/components/login/theme_widget";
import { Ripple } from "./components/common/spinners/spinners";
import { Logo } from "./components/common/logo";

const Login: React.FunctionComponent = React.lazy(() => import(      /* webpackChunkName: 'LoginView'    */ "./views/login"));
const Register: React.FunctionComponent = React.lazy(() => import(   /* webpackChunkName: 'RegisterView' */ "./views/register"));

const Fallback = <div className="ln-center-standalone"><Ripple size={120} /></div>;

export const App = () => (
    <Router>
        <Switch>
            <Route path={["/login", "/register"]}>
                <Fireflies density={175} />

                <ThemeWidget />

                <div className="ln-box">
                    <div className="ln-login-container ln-centered" style={{ zIndex: 1 }}>
                        <React.Suspense fallback={Fallback}>
                            <Route path={"/login"} >
                                <Login />
                            </Route>

                            <Route path={"/register"}>
                                <Register />
                            </Route>
                        </React.Suspense>

                        <Logo />
                    </div>
                </div>
            </Route >
        </Switch>
    </Router >
);

export default App;