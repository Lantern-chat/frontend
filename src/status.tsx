import React, { useState } from "react";
import ReactDOM from "react-dom";
import { } from 'react-dom/experimental';
import { } from 'react/experimental';

import "lib/polyfills";

import * as i18n from "ui/i18n";

import "ui/styles/root.scss";
import "ui/styles/layout.scss";

import { createLocale } from "ui/hooks/createLocale";

import { Ripple } from "ui/components/common/spinners/ripple";

import StatusPage from "ui/views/status";

let Root = () => {
    let locale = createLocale();

    let root = (
        <i18n.LocaleContext.Provider value={locale}>
            <StatusPage />
        </i18n.LocaleContext.Provider>
    );

    // don't need strict checking in prod
    if(__DEV__) {
        root = (<React.StrictMode>{root}</React.StrictMode>);
    }

    return root;
};

ReactDOM.createRoot(document.getElementById("ln-root")!).render(<Root />);

//ReactDOM.render(<Root />, document.getElementById('ln-root')!);
//ReactDOM.hydrate(<Root />, document.getElementById("ln-root")!);
//(ReactDOM as any).unstable_createRoot(document.getElementById("ln-root")!, { hydrate: false }).render(<Root />);
