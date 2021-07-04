import React, { useState } from "react";
import ReactDOM from "react-dom";
import { } from 'react-dom/experimental';
import { } from 'react/experimental';

import * as i18n from "ui/i18n";

import "ui/styles/root.scss";
import "ui/styles/layout.scss";

import App from "ui/App";
import { createLocale } from "ui/hooks/createLocale";

import { Ripple } from "ui/components/common/spinners/ripple";

const DEBUG_TOUCH = false;

let Root = () => {
    let locale = createLocale();

    let app = <App />;

    if(__DEV__ && DEBUG_TOUCH) {
        let [pos, setPos] = useState<{ x: number, y: number } | null>(null);

        let debug = pos && <div style={{
            position: 'absolute', width: '15px', height: '15px',
            top: pos.y, left: pos.x,
            borderRadius: '100%',
            backgroundColor: 'rgba(128, 128, 128, 0.5)',
            border: '2px solid blue',
            zIndex: 99999,
        }} />;

        let onTouch = (e: React.TouchEvent<HTMLDivElement>) => {
            let t = e.changedTouches[0];
            setPos({ x: t.screenX, y: t.screenY });
        };

        app = (
            <div onTouchMove={onTouch} onTouchStart={onTouch} onTouchEnd={onTouch} style={{ width: '100%', height: '100%' }}>
                {debug}
                {app}
            </div>
        );
    }

    let root = (
        <i18n.LocaleContext.Provider value={locale}>
            <React.Suspense fallback={<div className="ln-center-standalone"><Ripple size={160} /></div>}>
                {app}
            </React.Suspense>
        </i18n.LocaleContext.Provider>
    );

    // don't need strict checking in prod
    if(__DEV__) {
        root = (<React.StrictMode>{root}</React.StrictMode>);
    }

    return root;
};

//ReactDOM.render(<Root />, document.getElementById('ln-root')!);
//ReactDOM.hydrate(<Root />, document.getElementById("ln-root")!);
(ReactDOM as any).unstable_createRoot(document.getElementById("ln-root")!, { hydrate: true }).render(<Root />);

// https://github.com/nuxodin/ie11CustomProperties/blob/master/ie11CustomProperties.js
