import React from "react";
import ReactDOM from "react-dom";

const App = React.lazy(() => import(/* webpackChunkName: 'App' */'./App'));

ReactDOM.render(
    <React.Suspense fallback={<div />}>
        <App />
    </React.Suspense>,
    document.body
);