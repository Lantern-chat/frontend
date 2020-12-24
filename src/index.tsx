import React from "react";
import ReactDOM from "react-dom";

import * as i18n from "./ui/i18n";
i18n.preload("en"); // TODO: Change this based on cookies

const App = React.lazy(() => import(
    /* webpackChunkName: 'App' */
    /* webpackPrefetch: true */
    /* webpackPreload: true */
    './ui/App'
));

ReactDOM.render(
    <React.Suspense fallback={<div />}>
        <App />
    </React.Suspense>,
    document.body
);