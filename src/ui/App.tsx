import React, { useContext } from "react";

import { BrowserRouter as Router, Route, Switch, Redirect } from "react-router-dom";

import { Fireflies } from "ui/components/login/fireflies";
import { ThemeWidget } from "ui/components/login/theme_widget";
import { Ripple } from "ui/components/common/spinners";
import { Logo } from "ui/components/login/logo";
import { createTheme, Theme } from "ui/hooks/createTheme";
import { createSession } from "ui/hooks/createSession";
import { Session } from "client/session";


const MainView: React.FunctionComponent = React.lazy(() => import(       /* webpackCHunkName: 'MainView'     */ "./views/main"));
const LoginView: React.FunctionComponent = React.lazy(() => import(      /* webpackChunkName: 'LoginView'    */ "./views/login"));
const RegisterView: React.FunctionComponent = React.lazy(() => import(   /* webpackChunkName: 'RegisterView' */ "./views/register"));

const Fallback = <div className="ln-center-standalone"><Ripple size={120} /></div>;

const LoginRoutes = () => (
    <>
        <Fireflies density={175} />

        <ThemeWidget />

        <div className="ln-box ln-vertical-scroll">
            <div className="ln-login-container ln-centered" style={{ zIndex: 1 }}>
                <React.Suspense fallback={Fallback}>
                    <Switch>
                        <Route path="/login">
                            <LoginView />
                        </Route>

                        <Route path="/register">
                            <RegisterView />
                        </Route>
                    </Switch>

                    <Logo />
                </React.Suspense>
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
                    {session ? <Redirect to="channels/0/0" /> : <LoginRoutes />}
                </Route >

                <Route path="/channels">
                    {session ? <MainView /> : <Redirect to="/login" />}
                </Route>

                <Route>
                    {/* 404 */}
                    {session ? <Redirect to="channels/0/0" /> : <Redirect to="/login" />}
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