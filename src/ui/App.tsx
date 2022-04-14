
import { Dynamic, Suspense } from "solid-js/web";
import { createEffect, createMemo, createRenderEffect, createResource, createSignal, lazy, Match, on, Switch, untrack, useContext } from "solid-js";
import { MutantProvider } from "solid-mutant";

import { HISTORY, STORE } from "state/global";
import { useRootSelector } from "state/root";

import { Toasts } from "ui/components/toast";
import { Ripple } from "ui/components/common/spinners/ripple";

import { Fireflies } from "ui/views/login/components/fireflies";
import { ThemeWidget } from "ui/views/login/components/theme_widget";
import { LangWidget } from "./views/login/components/lang_widget";
import { Logo } from "ui/views/login/components/logo";

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

    let { LL } = /*#__PURE__*/useI18nContext();

    return (
        <>
            <Fireflies density={175} />

            <ThemeWidget />
            <LangWidget />

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
import { DETECTORS, LANGUAGES, useLocale } from "ui/i18n";

const MainWrapper = {
    default: () => {
        let { locale, setLocale } = useLocale();

        setLocale(locale()); // refresh locale

        // setup an effect to load the main namespace on locale changes
        createRenderEffect(() => {
            if(!loadedLocales[locale()].main) {
                loadNamespaceAsync(locale(), 'main').then(() => {
                    __DEV__ && console.log("Loaded main namespace for locale", locale());
                    setLocale(locale());
                })
            }
        });

        return <MainView />;
    }
};

const MainLoader = lazy(async () => {
    // TODO: Figure out how to include the english translation inside main itself
    await Promise.all([
        // NOTE: THis will have been set by the render effect below
        loadNamespaceAsync(localStorage.getItem(StorageKey.LOCALE) as Locales, 'main'),
        MainView.preload(),
    ]);

    return MainWrapper;
});

function AppRouter() {
    let location = useRootSelector(state => state.history.parts[0]);

    return (
        <Switch>
            <Match when={LOGIN_ROUTES.includes(location() as any)}>
                <LoginRoutes which={location() as any} />
            </Match>
            <Match when={MAIN_ROUTES.includes(location() as any)}>
                <Suspense fallback={<Fallback />}>
                    <MainLoader />
                </Suspense>
            </Match>
        </Switch>
    );
};

import { StorageKey } from "state/storage";

function AppInner() {
    let { locale } = useI18nContext();

    createRenderEffect(() => {
        let l = locale(), lang = LANGUAGES[l], rtl = !!lang.rtl;
        document.body.classList.toggle('ln-rtl', rtl);
        document.body.classList.toggle('ln-ltr', !rtl);

        // STORING LOCALE
        __DEV__ && console.log("Storing locale", l);
        localStorage.setItem(StorageKey.LOCALE, l);

        document.documentElement.lang = lang.d || l;
    });

    return (
        <MutantProvider store={STORE}>
            <Toasts />
            <AppRouter />
        </MutantProvider>
    )
}

// manually include english, always
import "ui/i18n/en-US";

import { detectLocale, loadedLocales } from "ui/i18n/i18n-util";

let initial_locale = localStorage.getItem(StorageKey.LOCALE) as Locales || /*#__INLINE__*/ detectLocale(...DETECTORS);

// sanitize locale
if(!(initial_locale in LANGUAGES)) {
    initial_locale = 'en-US';
}

// start pre-loading locale immediately upon script execution, not rendering
let loading_locale = loadLocaleAsync(initial_locale);

const I18NWrapper = {
    default: () => (
        <TypesafeI18n locale={initial_locale}>
            <AppInner />
        </TypesafeI18n>
    )
};

const I18NLoader = lazy(async () => {
    await loading_locale;
    return I18NWrapper;
});

export default function App() {
    // top-level suspense for locale loading, don't show UI until it's loaded.
    return (
        <Suspense fallback={<Fallback />}>
            <I18NLoader />
        </Suspense>
    );
}