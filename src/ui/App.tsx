import React, { Suspense, useContext } from "react";

import { BrowserRouter as Router, Route, Switch, Redirect, useParams } from "react-router-dom";

import { Fireflies } from "ui/components/login/fireflies";
import { ThemeWidget } from "ui/components/login/theme_widget";
import { Ripple } from "ui/components/common/spinners/ripple";
import { Logo } from "ui/components/login/logo";
import { createTheme, Theme } from "ui/hooks/createTheme";
import { createSession } from "ui/hooks/createSession";
import { Session } from "lib/session";


import { MainViewParameters } from "./views/main";
const MainView: React.FunctionComponent<MainViewParameters>
    = React.lazy(() => import(       /* webpackCHunkName: 'MainView'     */ "./views/main"));

const LoginView: React.FunctionComponent = React.lazy(() => import(      /* webpackChunkName: 'LoginView'    */ "./views/login"));
const RegisterView: React.FunctionComponent = React.lazy(() => import(   /* webpackChunkName: 'RegisterView' */ "./views/register"));
//const TestbedView: React.FunctionComponent = React.lazy(() => import(    /* webpackChunkName: 'TestbedView'  */ "./views/testbed"));


const Fallback = <div className="ln-center-standalone"><Ripple size={120} /></div>;

const LoginRoutes = () => (
    <>
        <Fireflies density={175} />

        <ThemeWidget />

        <div className="ln-box ln-scroll-y">
            <div className="ln-login-container ln-centered" style={{ zIndex: 1 }}>
                <Suspense fallback={Fallback}>
                    <Switch>
                        <Route path="/login">
                            <LoginView />
                        </Route>

                        <Route path="/register">
                            <RegisterView />
                        </Route>
                    </Switch>

                    <Logo />
                </Suspense>
            </div>
        </div>
    </>
);

// Create the router and paths
const AppRouter = () => {
    let { session } = useContext(Session);

    // NOTE: Using <Switch> ensures routes are rendered exclusively
    return (
        <Router>
            <Switch>
                <Route path={["/login", "/register"]}>
                    {session ? <Redirect to="/channels/@me" /> : <LoginRoutes />}
                </Route >

                <Route path="/channels">
                    {session ? <MainView session={session} /> : <Redirect to="/login" />}
                </Route>

                {/*
                <Route path="/testbed">
                    <TestbedView />
                </Route>*/}

                <Route>
                    {/* 404 */}
                    {session ? <Redirect to="/channels/@me" /> : <Redirect to="/login" />}
                </Route>
            </Switch>
        </Router >
    );
}

// Provide non-Redux app-specific contexts
export const App = () => {
    let theme_context = createTheme();
    let session_context = createSession();

    return (
        <Theme.Provider value={theme_context}>
            <Session.Provider value={session_context}>
                <AppRouter />
            </Session.Provider>
        </Theme.Provider>
    );
};

export default App;