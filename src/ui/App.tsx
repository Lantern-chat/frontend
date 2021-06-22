import React, { Suspense, useContext, useEffect, useMemo } from "react";
import { createBrowserHistory } from "history";
import { createStore } from "redux";
import { Provider, useSelector } from "react-redux";
import { RootState } from "state/root";

import { enhancers, initialReducer, Type } from "state/initial";

import { Fireflies } from "ui/components/login/fireflies";
import { ThemeWidget } from "ui/components/login/theme_widget";
import { Ripple } from "ui/components/common/spinners/ripple";
import { Logo } from "ui/components/login/logo";
import { selectPath } from "state/selectors/selectPath";
import { HistoryContext } from "./hooks/useHistory";
import { Link } from "./components/link";
import { initialSession } from "lib/session";

//import { MainViewParameters } from "./views/main";
//const MainView: React.FunctionComponent<MainViewParameters>
//    = React.lazy(() => import(       /* webpackCHunkName: 'MainView'     */ "./views/main"));
//const LoginView: React.FunctionComponent = React.lazy(() => import(      /* webpackChunkName: 'LoginView'    */ "./views/login"));
//const RegisterView: React.FunctionComponent = React.lazy(() => import(   /* webpackChunkName: 'RegisterView' */ "./views/register"));
//const TestbedView: React.FunctionComponent = React.lazy(() => import(    /* webpackChunkName: 'TestbedView'  */ "./views/testbed"));


const Fallback = <div className="ln-center-standalone"><Ripple size={120} /></div>;
/*
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
const AppRouter2 = () => {
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

                <Route>
                    {session ? <Redirect to="/channels/@me" /> : <Redirect to="/login" />}
                </Route>
            </Switch>
        </Router >
    );
}*/


export const HISTORY = createBrowserHistory();
export const STORE = createStore(initialReducer, {
    history: { history: HISTORY, location: HISTORY.location },
    user: { session: initialSession }
}, enhancers);

HISTORY.listen(update => STORE.dispatch({ type: Type.HISTORY_UPDATE, update }));

const ACCEPTABLE_PATHS = ['login', 'register', 'channels'];
let first_part = HISTORY.location.pathname.slice(1).split('/', 1)[0];

if(ACCEPTABLE_PATHS.indexOf(first_part) == -1) {
    HISTORY.replace(initialSession != null ? '/channels/@me' : '/login')
}

const AppRouter = React.memo(() => {
    let { parts } = useSelector(selectPath);

    switch(parts[0]) {
        case 'login': return <div>Login</div>;
        case 'register': return <div>Register</div>;
        case 'channels': return <div>Channels<Link href="/login">Login</Link></div>;
    }

    return Fallback;
});

// HistoryContext is used for history actions, NOT looking up history data
// Redux store is used for all view-related data, including history data
export const App = () => {
    return (
        <HistoryContext.Provider value={HISTORY}>
            <Provider store={STORE}>
                <AppRouter />
            </Provider>
        </HistoryContext.Provider>
    );
};

export default App;