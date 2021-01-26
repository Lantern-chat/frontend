import React from "react";
import ReactDOM from "react-dom";
import { } from 'react-dom/experimental'
import { } from 'react/experimental';

import * as i18n from "ui/i18n";

import "ui/styles/root.scss";
import "ui/styles/layout.scss";

import { ClientModel, ClientContext } from "models/client";
import * as theme from "client/theme";

export const CLIENT = new ClientModel();

// Begin fetching App immediately, but split
// it to lessen immediate chunk size.
const App = React.lazy(() => import(
    /* webpackChunkName: 'App' */
    /* webpackPrefetch: true */
    /* webpackPreload: true */
    './ui/App'
));

// Simple full-screen loader icon
import { Ripple } from "ui/components/common/spinners/spinners";

const Loading = React.memo(() => (<div className="ln-center-standalone"><Ripple size={160} /></div>));

let root = (
    <React.Suspense fallback={<Loading />}>
        <ClientContext.Provider value={() => CLIENT}>
            <i18n.LocaleContext.Provider value={CLIENT.currentLanguage}>
                <theme.Theme.Provider value={CLIENT.theme}>
                    <App />
                </theme.Theme.Provider>
            </i18n.LocaleContext.Provider>
        </ClientContext.Provider>
    </React.Suspense>
);

// don't need strict checking in prod
if(process.env.NODE_ENV !== 'production') {
    root = (<React.StrictMode>{root}</React.StrictMode>);
}

//React.render(root, document.getElementById('ln-root')!);
ReactDOM.unstable_createRoot(document.getElementById("ln-root")!).render(root);

// Do this after React startup so it can display the spinner
CLIENT.start();


// https://github.com/nuxodin/ie11CustomProperties/blob/master/ie11CustomProperties.js

(window as any).setDarkTheme = function(temperature: number) {
    CLIENT.theme.is_light = false;
    CLIENT.theme.temperature = temperature;
    theme.setTheme(theme.genDarkTheme(temperature), true, false);
};

(window as any).setLightTheme = function(temperature: number) {
    CLIENT.theme.is_light = true;
    CLIENT.theme.temperature = temperature;
    theme.setTheme(theme.genLightTheme(temperature), true, true);
};