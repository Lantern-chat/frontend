
import { Dynamic, Suspense } from "solid-js/web";
import { createMemo, createRenderEffect, createResource, createSignal, lazy, Match, Switch, useContext } from "solid-js";
import { Provider as MutantProvider } from "solid-mutant";
import { IHistoryState } from "state/mutators";

import { HISTORY, STORE } from "state/global";
import { useRootSelector } from "state/root";

import { Toasts } from "./components/toast";
import { Fireflies } from "ui/components/login/fireflies";
import { ThemeWidget } from "ui/components/login/theme_widget";
import { Ripple } from "ui/components/common/spinners/ripple";
import { Logo } from "ui/components/login/logo";
import { HistoryContext } from "./components/history";

import LoginView from "./views/login";
import RegisterView from "./views/register";

const MainView = lazy(() => import(/* webpackChunkName: 'MainView' */ "./views/main"));

const Fallback = () => <div className="ln-center-standalone"><Ripple size={120} /></div>;

const LOGIN_ROUTES = ['login', 'register'] as const; //, 'register', 'verify', 'reset'] as const;
const MAIN_ROUTES = ['channels', 'invite', 'settings'] as const;

function LoginRoutes(props: { which: typeof LOGIN_ROUTES[number] }) {
    let View = createMemo(() => {
        switch(props.which) {
            case 'login': return LoginView;
            case 'register': return RegisterView;
            //case 'register': View = RegisterView; break;
            //case 'verify': View = VerifyView; break;
            //case 'reset': View = ResetView; break;
        }
    });

    return (
        <>
            <Fireflies density={175} />

            <ThemeWidget />

            {__DEV__ && <div className="ln-dev-banner">This is a development build.</div>}

            <div className="ln-box ln-scroll-y">
                <div className="ln-login-container ln-centered" style={{ zIndex: 1 }}>
                    <Suspense fallback={Fallback}>
                        <Dynamic component={View()} />
                        <Logo />
                    </Suspense>
                </div>
            </div>
        </>
    );
}

function AppRouter() {
    let location = useRootSelector(state => state.history.parts[0]);

    return (
        <Switch>
            <Match when={LOGIN_ROUTES.includes(location() as any)}>
                <LoginRoutes which={location() as any} />
            </Match>
            <Match when={MAIN_ROUTES.includes(location() as any)}>
                <Suspense fallback={Fallback}>
                    <MainView />
                </Suspense>
            </Match>
        </Switch>
    );
};

import { StorageKey } from "state/storage";
import TypesafeI18n, { useI18nContext } from "ui/i18n/i18n-solid";
import { loadLocaleAsync } from "ui/i18n/i18n-util.async";
import { Locales } from "ui/i18n/i18n-types";

// manually include english, always
import "ui/i18n/en";

// start pre-loading locale immediately upon script execution, not rendering
let initial_locale = localStorage.getItem(StorageKey.LOCALE) as Locales || 'en';
let loading_locale = loadLocaleAsync(initial_locale);

// pretend component that uses `lazy` to defer rendering the real UI until locales are loaded.
const I18NLoader = lazy(async () => {
    await loading_locale;

    return {
        default: () => {
            useI18nContext().setLocale(initial_locale);
            return null;
        }
    }
});

export default function App() {
    // top-level suspense for locale loading, don't show UI until it's loaded.
    return (
        <Suspense fallback={Fallback}>
            <TypesafeI18n locale="en">
                <I18NLoader />

                <MutantProvider store={STORE}>
                    <Toasts />

                    <HistoryContext.Provider value={STORE.state.history as IHistoryState}>
                        <AppRouter />
                    </HistoryContext.Provider>
                </MutantProvider>
            </TypesafeI18n>
        </Suspense >
    );
}