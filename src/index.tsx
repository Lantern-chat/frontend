import React from "react";
import ReactDOM from "react-dom";

import "./ui/styles/root.scss";

import * as i18n from "./ui/i18n";
i18n.preload("en"); // TODO: Change this based on cookies

const App = React.lazy(() => import(
    /* webpackChunkName: 'App' */
    /* webpackPrefetch: true */
    /* webpackPreload: true */
    './ui/App'
));

import { Ripple } from "./ui/components/common/spinners/spinners";

const Loading = React.memo(() => (
    <div className="center">
        <Ripple size={160} />
    </div>
));

ReactDOM.render(
    <React.Suspense fallback={<Loading />}>
        <App />
    </React.Suspense>,
    document.body
);