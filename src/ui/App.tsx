import React, { Suspense, useContext, useEffect, useMemo, useState } from "react";
import { Provider, useSelector } from "react-redux";

import { HISTORY, STORE } from "state/global";


import { Fireflies } from "ui/components/login/fireflies";
import { ThemeWidget } from "ui/components/login/theme_widget";
import { Ripple } from "ui/components/common/spinners/ripple";
import { Logo } from "ui/components/login/logo";
import { HistoryContext, recomputeHistoryContext } from "./components/history";

const MainView: React.FunctionComponent = React.lazy(() => import(       /* webpackCHunkName: 'MainView'     */ "./views/main"));
const LoginView: React.FunctionComponent = React.lazy(() => import(      /* webpackChunkName: 'LoginView'    */ "./views/login"));
const RegisterView: React.FunctionComponent = React.lazy(() => import(   /* webpackChunkName: 'RegisterView' */ "./views/register"));
//const TestbedView: React.FunctionComponent = React.lazy(() => import(    /* webpackChunkName: 'TestbedView'  */ "./views/testbed"));


const Fallback = <div className="ln-center-standalone"><Ripple size={120} /></div>;

const LoginRoutes = React.memo(({ which }: { which: 'login' | 'register' }) => {
    let View = which == 'login' ? LoginView : RegisterView;

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
});

const AppRouter = () => {
    let ctx = useContext(HistoryContext),
        first_part = ctx.parts[0];

    switch(first_part) {
        case 'login':
        case 'register':
            return <LoginRoutes which={first_part} />;
        case 'channels':
            return <MainView />;
    }

    return null;
};

const AppInner = React.memo(() => {
    return (
        <Provider store={STORE}>
            <AppRouter />
        </Provider>
    );
});

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