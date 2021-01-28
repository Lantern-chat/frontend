import Preact, { useState, useEffect, useLayoutEffect } from "preact/compat";

import { Router, Route, Switch, Link, useRoute } from "wouter-preact";

import useLocation from "wouter/use-location";

import makeMatcher, { Match, MatcherFn, MatchWithParams, NoMatch } from "wouter/matcher";

const defaultMatcher = makeMatcher();

/*
 * A custom routing matcher function that supports multipath routes
 */
const multipathMatcher: MatcherFn = (patterns, path): Match => {
    for(let pattern of patterns) {
        const [match, params] = defaultMatcher(pattern, path);
        if(match) {
            return [match, params] as MatchWithParams;
        }
    }

    return [false, null] as NoMatch;
};


import { Fireflies } from "ui/components/login/fireflies";
import { ThemeWidget } from "ui/components/login/theme_widget";
import { Ripple } from "./components/common/spinners/spinners";
import { Logo } from "./components/login/logo";

const Login: Preact.FunctionComponent = Preact.lazy(() => import(      /* webpackChunkName: 'LoginView'    */ "./views/login"));
const Register: Preact.FunctionComponent = Preact.lazy(() => import(   /* webpackChunkName: 'RegisterView' */ "./views/register"));

const Fallback = <div className="ln-center-standalone"><Ripple size={120} /></div>;

import * as theme from "client/theme";
import { Theme, IThemeContext } from "client/theme";

let IS_FIRST_THEME = true;

let existing_theme: string | null | IThemeContext = localStorage.getItem('theme');
if(existing_theme) {
    existing_theme = JSON.parse(existing_theme) as IThemeContext;
}

export const App = () => {
    let [theme_context, setThemeContext] = useState<IThemeContext>(existing_theme as IThemeContext || theme.DEFAULT_THEME);

    useLayoutEffect(() => {
        if(theme_context.is_light) {
            theme.setTheme(theme.genLightTheme(theme_context.temperature), !IS_FIRST_THEME, true);
        } else {
            theme.setTheme(theme.genDarkTheme(theme_context.temperature), !IS_FIRST_THEME, false);
        }

        IS_FIRST_THEME = false;

        localStorage.setItem('theme', JSON.stringify(theme_context));
    }, [theme_context.is_light, theme_context.temperature]);

    theme_context.setTheme = (new_theme: theme.IThemeContext) => {
        setThemeContext(new_theme);
    };


    return (
        <Theme.Provider value={theme_context}>

            <Router matcher={multipathMatcher}>
                <Route path={["/login", "/register"] as any}>
                    <Fireflies density={175} />

                    <ThemeWidget />

                    <div className="ln-box">
                        <div className="ln-login-container ln-centered" style={{ zIndex: 1 }}>
                            <Switch>
                                <Route path={["/login"] as any} >
                                    <Preact.Suspense fallback={Fallback}>
                                        <Login />
                                    </Preact.Suspense>
                                </Route>

                                <Route path={["/register"] as any}>
                                    <Preact.Suspense fallback={Fallback}>
                                        <Register />
                                    </Preact.Suspense>
                                </Route>
                            </Switch>

                            <Logo />
                        </div>
                    </div>
                </Route >
            </Router >
        </Theme.Provider>
    );
};

export default App;