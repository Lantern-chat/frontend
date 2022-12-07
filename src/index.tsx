import "lib/polyfills";

import { render, DelegatedEvents } from "solid-js/web";

DelegatedEvents.clear();
for(let e of ['click', 'contextmenu', 'dblclick', 'keydown', 'keyup']) {
    DelegatedEvents.add(e);
}

import "ui/styles/root.scss";
import "ui/styles/layout.scss";

import "ui/styles/lib/fonts/lato.css";
import "ui/styles/lib/fonts/opendyslexic.css";
import "ui/styles/lib/fonts/atkinson_hyperlegible.css";
import "ui/styles/lib/fonts/dramasans.css";
import "ui/styles/lib/fonts/hasklig.css";

import App from "ui/App";

render(() => <App />, document.getElementById("ln-root")!);