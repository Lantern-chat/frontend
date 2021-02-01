import React from "react";
import ReactDOM from "react-dom";
import { } from 'react-dom/experimental'
import { } from 'react/experimental';

import * as i18n from "ui/i18n";

import "ui/styles/root.scss";
import "ui/styles/layout.scss";

import App from "ui/App";
import { useLocale } from "ui/hooks/useLocale";

import { Ripple } from "ui/components/common/spinners";

const Loading = React.memo(() => (<div className="ln-center-standalone"><Ripple size={160} /></div>));


let Root = () => {
    let locale = useLocale();

    let root = (
        <i18n.LocaleContext.Provider value={locale}>
            <React.Suspense fallback={<Loading />}>
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
ReactDOM.unstable_createRoot(document.getElementById("ln-root")!).render(<Root />);

// https://github.com/nuxodin/ie11CustomProperties/blob/master/ie11CustomProperties.js
