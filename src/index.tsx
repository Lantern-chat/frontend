import React from "react";
import ReactDOM from "react-dom";
import { } from 'react-dom/experimental'
import { } from 'react/experimental';

import * as i18n from "./ui/i18n";

import "./ui/styles/root.scss";

import { ClientModel, ClientContext } from "./models/client";
const CLIENT = new ClientModel();

// Begin fetching App immediately, but split
// it to lessen immediate chunk size.
const App = React.lazy(() => import(
    /* webpackChunkName: 'App' */
    /* webpackPrefetch: true */
    /* webpackPreload: true */
    './ui/App'
));

// Simple full-screen loader icon
import { Ripple } from "./ui/components/common/spinners/spinners";
const Loading = React.memo(() => (<div className="center"><Ripple size={160} /></div>));

let root = (
    <React.Suspense fallback={<Loading />}>
        <i18n.LocaleContext.Provider value={CLIENT.currentLanguage}>
            <ClientContext.Provider value={() => CLIENT}>
                <App />
            </ClientContext.Provider>
        </i18n.LocaleContext.Provider>
    </React.Suspense>
);

// don't need strict checking in prod
if(process.env.NODE_ENV !== 'production') {
    root = (<React.StrictMode>{root}</React.StrictMode>);
}

// Setup concurrent root
ReactDOM.unstable_createRoot(document.getElementById("ln-root")!).render(root);

// Do this after React startup so it can display the spinner
CLIENT.start();