import React from "react";
import ReactDOM from "react-dom";
import { } from 'react-dom/experimental'
import { } from 'react/experimental';

import "./ui/styles/root.scss";

import * as i18n from "./ui/i18n";

/** Get language from `localStorage` or default to English */
function getLanguage(): i18n.Language {
    return (localStorage.getItem("lang") as i18n.Language | null) || "en";
}
i18n.preload(getLanguage());

// Begin fetching App immediately, but split
// it to lessen immediate chunk size.
const App = React.lazy(() => import(
    /* webpackChunkName: 'App' */
    /* webpackPrefetch: true */
    /* webpackPreload: true */
    './ui/App'
));

import { Ripple } from "./ui/components/common/spinners/spinners";

// Simple full-screen loader icon
const Loading = React.memo(() => (<div className="center"><Ripple size={160} /></div>));

// Setup concurrent root
ReactDOM.unstable_createRoot(document.getElementById("ln-root")!).render(
    // Place entire up under the `Suspense` and `LocaleContext` providers
    <React.StrictMode>
        <React.Suspense fallback={<Loading />}>
            <i18n.LocaleContext.Provider value={getLanguage()}>
                <App />
            </i18n.LocaleContext.Provider>
        </React.Suspense>
    </React.StrictMode>,
);