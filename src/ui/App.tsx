import React from "react";

import { BrowserRouter as Router, Route, Switch, Link, Redirect } from "react-router-dom";

import { Fireflies } from "ui/components/login/fireflies";
import { ThemeWidget } from "ui/components/login/theme_widget";
import { Ripple } from "./components/common/spinners/spinners";
import { Logo } from "./components/login/logo";
import { useTheme, Theme } from "./hooks/useTheme";


const MainView: React.FunctionComponent = React.lazy(() => import(       /* webpackCHunkName: 'MainView'     */ "./views/main"));
const LoginView: React.FunctionComponent = React.lazy(() => import(      /* webpackChunkName: 'LoginView'    */ "./views/login"));
const RegisterView: React.FunctionComponent = React.lazy(() => import(   /* webpackChunkName: 'RegisterView' */ "./views/register"));

const Fallback = <div className="ln-center-standalone"><Ripple size={120} /></div>;

// TODO: Find a way to force rerender when user changes
const MainViewRedirect = React.memo(({ user }: { user: string | null }) => (
    user != null ? <MainView /> : <Redirect to="/login" />
));

// NOTE: Using <Switch> ensures routes are rendered exclusively
export const App = () => {
    let theme_context = useTheme();

    return (
        <Theme.Provider value={theme_context}>
            <Router>
                <Switch>
                    <Route path={["/login", "/register"] as any}>
                        <Fireflies density={175} />

                        <ThemeWidget />

                        <div className="ln-box">
                            <div className="ln-login-container ln-centered" style={{ zIndex: 1 }}>
                                <React.Suspense fallback={Fallback}>
                                    <Switch>
                                        <Route path={["/login"] as any} >
                                            <LoginView />
                                        </Route>

                                        <Route path={["/register"] as any}>
                                            <RegisterView />
                                        </Route>
                                    </Switch>

                                    <Logo />
                                </React.Suspense>
                            </div>
                        </div>
                    </Route >

                    <Route path="/">
                        <MainViewRedirect user={localStorage.getItem('user')} />
                    </Route>
                </Switch>
            </Router >
        </Theme.Provider>
    );
};

export default App;