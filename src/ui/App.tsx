import React, { Suspense, useContext, useEffect, useMemo, useState } from "react";
import { Provider, useSelector } from "react-redux";

import { HISTORY, STORE } from "state/global";


import { Toasts } from "./components/toast";
import { Fireflies } from "ui/components/login/fireflies";
import { ThemeWidget } from "ui/components/login/theme_widget";
import { Ripple } from "ui/components/common/spinners/ripple";
import { Logo } from "ui/components/login/logo";
import { HistoryContext, recomputeHistoryContext } from "./components/history";

const MainView: React.FunctionComponent = React.lazy(() => import(      /* webpackChunkName: 'MainView'     */ "./views/main"));
//const LoginView: React.FunctionComponent = React.lazy(() => import(     /* webpackChunkName: 'LoginView'    */ "./views/login"));
//const RegisterView: React.FunctionComponent = React.lazy(() => import(  /* webpackChunkName: 'RegisterView' */ "./views/register"));
const VerifyView: React.FunctionComponent = React.lazy(() => import(    /* webpackChunkName: 'VerifyView'   */ "./views/verify"));
const ResetView: React.FunctionComponent = React.lazy(() => import(     /* webpackChunkName: 'ResetView'    */ "./views/reset"));

//const TestbedView: React.FunctionComponent = React.lazy(() => import(    /* webpackChunkName: 'TestbedView'  */ "./views/testbed"));

import LoginView from "./views/login";
import RegisterView from "./views/register";

const Fallback = <div className="ln-center-standalone"><Ripple size={120} /></div>;

const ValidLoginLikePaths = ['login', 'register', 'verify', 'reset'] as const;

const LoginRoutes = React.memo(({ which }: { which: typeof ValidLoginLikePaths[number] }) => {
    let View;
    switch(which) {
        case 'login': View = LoginView; break;
        case 'register': View = RegisterView; break;
        case 'verify': View = VerifyView; break;
        case 'reset': View = ResetView; break;
    }

    return (
        <>
            <Fireflies density={175} />

            <ThemeWidget />

            {__DEV__ && <DevBanner />}

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

const DevBanner = React.memo(() => {
    return (
        <div className="ln-dev-banner">This is a development build.</div>
    )
});

const AppRouter = () => {
    let ctx = useContext(HistoryContext),
        first_part = ctx.parts[0];

    switch(first_part) {
        case 'login':
        case 'register':
        case 'verify':
        case 'reset':
            return <LoginRoutes which={first_part} />;
        case 'channels':
        case 'invite':
        case 'settings':
            return <MainView />;
    }

    return null;
};

const AppInner = React.memo(() => {
    return (
        <Provider store={STORE}>
            <Toasts />
            <AppRouter />
        </Provider>
    );
});

import "ui/styles/lib/fonts/lato.css";
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

if(__DEV__) {
    App.displayName = "App";
    AppInner.displayName = "AppInner";
    AppRouter.displayName = "AppRouter";
    LoginRoutes.displayName = "LoginRoutes";
    DevBanner.displayName = "DevBanner";
}