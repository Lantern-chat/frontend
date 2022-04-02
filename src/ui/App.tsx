
import { Dynamic, Suspense } from "solid-js/web";
import { createEffect, createMemo, createRenderEffect, createResource, createSignal, lazy, Match, on, Switch, untrack, useContext } from "solid-js";
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

    let { LL } = useI18nContext();

    return (
        <>
            <Fireflies density={175} />

            <ThemeWidget />

            {__DEV__ && <div className="ln-dev-banner" textContent={LL().DEV_BANNER()} />}

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

import type { Locales } from "ui/i18n/i18n-types";
import TypesafeI18n, { useI18nContext } from "ui/i18n/i18n-solid";
import { loadLocaleAsync, loadNamespaceAsync } from "ui/i18n/i18n-util.async";

const MainWrapper = lazy(async () => {
    // TODO: Figure out how to include the english translation inside main itself
    await Promise.all([
        loadNamespaceAsync(localStorage.getItem(StorageKey.LOCALE) as Locales || initial_locale, 'main'),
        MainView.preload(),
    ]);

    return {
        default: () => {
            let { locale, setLocale } = useI18nContext();

            setLocale(locale()); // refresh locale

            // setup an effect to load the main namespace on locale changes
            createRenderEffect(() => loadNamespaceAsync(locale(), 'main').then(() => {
                __DEV__ && console.log("Loaded main namespace for locale", locale());

                setLocale(locale());
            }));

            return <MainView />;
        },
    }
});

function AppRouter() {
    let location = useRootSelector(state => state.history.parts[0]);

    return (
        <Switch>
            <Match when={LOGIN_ROUTES.includes(location() as any)}>
                <LoginRoutes which={location() as any} />
            </Match>
            <Match when={MAIN_ROUTES.includes(location() as any)}>
                <Suspense fallback={Fallback}>
                    <MainWrapper />
                </Suspense>
            </Match>
        </Switch>
    );
};

import { StorageKey } from "state/storage";
import { detectLocale } from "ui/i18n/i18n-util";
import { DETECTORS } from "ui/i18n";

// manually include english, always
import "ui/i18n/en";
import dayjs from "lib/time";

// start pre-loading locale immediately upon script execution, not rendering
let initial_locale = localStorage.getItem(StorageKey.LOCALE) as Locales || /*#__INLINE__*/ detectLocale(...DETECTORS);
let loading_locale = loadLocaleAsync(initial_locale);

const I18NWrapper = lazy(async () => {
    await loading_locale;

    return {
        default: () => {
            let { locale, setLocale } = useI18nContext();

            setLocale(initial_locale);

            createRenderEffect(() => dayjs.locale(locale()));

            return (
                <MutantProvider store={STORE}>
                    <Toasts />

                    <HistoryContext.Provider value={STORE.state.history as IHistoryState}>
                        <AppRouter />
                    </HistoryContext.Provider>
                </MutantProvider>
            );
        }
    }
});

export default function App() {
    // top-level suspense for locale loading, don't show UI until it's loaded.
    return (
        <TypesafeI18n locale="en">
            <Suspense fallback={Fallback}>
                <I18NWrapper />
            </Suspense>
        </TypesafeI18n>
    );
}