import Preact, { useState, useEffect } from "preact/compat";

if(process.env.NODE_ENV !== 'production') {
    require("preact/debug");
}

import * as i18n from "ui/i18n";

import "ui/styles/root.scss";
import "ui/styles/layout.scss";

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

let Root = () => {
    let [locale, setLocale] = useState<i18n.ILocaleContext>({ lang: "en", setLocale: (locale: i18n.Language) => { } });
    locale.setLocale = (lang: i18n.Language) => setLocale({ ...locale, lang });

    let root = (
        <i18n.LocaleContext.Provider value={locale}>
            <Preact.Suspense fallback={<Loading />}>
                <App />
            </Preact.Suspense>
        </i18n.LocaleContext.Provider>
    );

    // don't need strict checking in prod
    if(process.env.NODE_ENV !== 'production') {
        root = (<Preact.StrictMode>{root}</Preact.StrictMode>);
    }

    return root;
};



Preact.render(<Root />, document.getElementById('ln-root')!);
//ReactDOM.unstable_createRoot(document.getElementById("ln-root")!).render(root);

// https://github.com/nuxodin/ie11CustomProperties/blob/master/ie11CustomProperties.js
