import React from "react";
import ReactDOM from "react-dom";
import { } from 'react-dom/experimental'
import { } from 'react/experimental';

import "./ui/styles/root.scss";

import * as i18n from "./ui/i18n";

function getLanguage(): i18n.Language {
    return (localStorage.getItem("lang") as i18n.Language | null) || "en";
}
i18n.preload(getLanguage());

const App = React.lazy(() => import(
    /* webpackChunkName: 'App' */
    /* webpackPrefetch: true */
    /* webpackPreload: true */
    './ui/App'
));

import { Ripple } from "./ui/components/common/spinners/spinners";

const Loading = React.memo(() => (
    <div className="center">
        <Ripple size={160} />
    </div>
));

ReactDOM.unstable_createRoot(document.getElementById("ln-root")!).render(
    <i18n.LocaleContext.Provider value={getLanguage()}>
        <React.Suspense fallback={<Loading />}>
            <App />
        </React.Suspense>
    </i18n.LocaleContext.Provider>,
);