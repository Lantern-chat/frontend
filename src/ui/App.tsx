import Preact from "preact/compat";

import { Router, Route, Link, useRoute } from "wouter-preact";

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
import { Ripple } from "./components/common/spinners/spinners";
import { Logo } from "./components/common/logo";

const Login: Preact.FunctionComponent = Preact.lazy(() => import(      /* webpackChunkName: 'LoginView'    */ "./views/login"));
const Register: Preact.FunctionComponent = Preact.lazy(() => import(   /* webpackChunkName: 'RegisterView' */ "./views/register"));

const Fallback = <div className="ln-center-standalone"><Ripple size={120} /></div>;

export const App = () => (
    <Router matcher={multipathMatcher}>
        <Route path={["/login", "/register"] as any}>
            <Fireflies count={80} />
            <div className="ln-box">
                <div className="ln-login-container ln-centered" style={{ zIndex: 1 }}>
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

                    <Logo />
                </div>
            </div>
        </Route >
    </Router >
);

export default App;