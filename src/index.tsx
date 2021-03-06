import React from "react";
import ReactDOM from "react-dom";
import { } from 'react-dom/experimental';
import { } from 'react/experimental';

import * as i18n from "ui/i18n";

import "ui/styles/root.scss";
import "ui/styles/layout.scss";

import App from "ui/App";
import { createLocale } from "ui/hooks/createLocale";

import { Ripple } from "ui/components/common/spinners/ripple";

let Root = () => {
    let locale = createLocale();

    let root = (
        <i18n.LocaleContext.Provider value={locale}>
            <React.Suspense fallback={<div className="ln-center-standalone"><Ripple size={160} /></div>}>
                <App />
            </React.Suspense>
        </i18n.LocaleContext.Provider>
    );

    // don't need strict checking in prod
    if(process.env.NODE_ENV !== 'production') {
        root = (<React.StrictMode>{root}</React.StrictMode>);
    }

    return root;
};

//React.render(<Root />, document.getElementById('ln-root')!);
//ReactDOM.hydrate(<Root />, document.getElementById("ln-root")!);
ReactDOM.unstable_createRoot(document.getElementById("ln-root")!, { hydrate: true }).render(<Root />);

// https://github.com/nuxodin/ie11CustomProperties/blob/master/ie11CustomProperties.js
