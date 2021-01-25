import Preact from "preact/compat";

if(process.env.NODE_ENV !== 'production') {
    require("preact/debug");
}

import * as i18n from "ui/i18n";

import "ui/styles/root.scss";
import "ui/styles/layout.scss";

import { ClientModel, ClientContext } from "models/client";
const CLIENT = new ClientModel();

// Begin fetching App immediately, but split
// it to lessen immediate chunk size.
const App = Preact.lazy(() => import(
    /* webpackChunkName: 'App' */
    /* webpackPrefetch: true */
    /* webpackPreload: true */
    './ui/App'
));

// Simple full-screen loader icon
import { Ripple } from "ui/components/common/spinners/spinners";

const Loading = Preact.memo(() => (<div className="ln-center-standalone"><Ripple size={160} /></div>));

let root = (
    <Preact.Suspense fallback={<Loading />}>
        <ClientContext.Provider value={() => CLIENT}>
            <i18n.LocaleContext.Provider value={CLIENT.currentLanguage}>
                <App />
            </i18n.LocaleContext.Provider>
        </ClientContext.Provider>
    </Preact.Suspense>
);

// don't need strict checking in prod
if(process.env.NODE_ENV !== 'production') {
    root = (<Preact.StrictMode>{root}</Preact.StrictMode>);
}

Preact.render(root, document.getElementById('ln-root')!);

// Do this after React startup so it can display the spinner
CLIENT.start();


// https://github.com/nuxodin/ie11CustomProperties/blob/master/ie11CustomProperties.js