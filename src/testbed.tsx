import React from "react";
import ReactDOM from "react-dom";

import "ui/styles/root.scss";
import "ui/styles/layout.scss";

import { Ripple } from "ui/components/common/spinners/ripple";

import { Testbed } from "ui/views/testbed";

let Root = () => {
    let root = (
        <React.Suspense fallback={<div className="ln-center-standalone"><Ripple size={160} /></div>}>
            <Testbed />
        </React.Suspense>
    );

    // don't need strict checking in prod
    if(__DEV__) {
        root = (<React.StrictMode>{root}</React.StrictMode>);
    }

    return root;
};

ReactDOM.createRoot(document.getElementById("ln-root")!, { hydrate: true }).render(<Root />);