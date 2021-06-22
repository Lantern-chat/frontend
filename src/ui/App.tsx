import React, { Suspense, useContext, useEffect, useMemo, useState } from "react";
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
import { Link, HistoryContext, recomputeHistoryContext } from "./components/history";
import { initialSession } from "lib/session";

//import { MainViewParameters } from "./views/main";
//const MainView: React.FunctionComponent<MainViewParameters>
//    = React.lazy(() => import(       /* webpackCHunkName: 'MainView'     */ "./views/main"));
const LoginView: React.FunctionComponent = React.lazy(() => import(      /* webpackChunkName: 'LoginView'    */ "./views/login"));
const RegisterView: React.FunctionComponent = React.lazy(() => import(   /* webpackChunkName: 'RegisterView' */ "./views/register"));
//const TestbedView: React.FunctionComponent = React.lazy(() => import(    /* webpackChunkName: 'TestbedView'  */ "./views/testbed"));


const Fallback = <div className="ln-center-standalone"><Ripple size={120} /></div>;

const LoginRoutes = () => {
    let ctx = useContext(HistoryContext);

    let View = ctx.parts[0] == 'login' ? LoginView : RegisterView;

    return (
        <>
            <Fireflies density={175} />

            <ThemeWidget />

            <div className="ln-box ln-scroll-y">
                <div className="ln-login-container ln-centered" style={{ zIndex: 1 }}>
                    <Suspense fallback={Fallback}>
                        <View />
                        <Logo />
                    </Suspense>
                </div>
            </div>
        </>
    );
};

/*
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

const AppRouter = () => {
    let ctx = useContext(HistoryContext);

    switch(ctx.parts[0]) {
        case 'login':
        case 'register':
            return <LoginRoutes />;
        case 'channels':
            return <div>Channels<Link href="/login">Login</Link></div>;
    }

    return null;
};


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
} else if(['login', 'register'].indexOf(first_part) >= 0 && initialSession != null) {
    HISTORY.replace('/channels/@me');
}

const AppInner = React.memo(() => {
    return (
        <Provider store={STORE}>
            <AppRouter />
        </Provider>
    );
});

// HistoryContext is used for history actions, NOT looking up history data
// Redux store is used for all view-related data, including history data
export const App = () => {
    let [history, setHistory] = useState(recomputeHistoryContext(HISTORY));

    useEffect(() => HISTORY.listen(() => setHistory(recomputeHistoryContext(HISTORY))), []);

    return (
        <HistoryContext.Provider value={history}>
            <AppInner />
        </HistoryContext.Provider>
    );
};

export default App;