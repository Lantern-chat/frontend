import { render } from "solid-js/web";

import "lib/polyfills";

import "ui/styles/root.scss";
import "ui/styles/layout.scss";

import "ui/styles/lib/fonts/lato.css";
import "ui/styles/lib/fonts/opendyslexic.css";
import "ui/styles/lib/fonts/dramasans.css";
import "ui/styles/lib/fonts/hasklig.css";

import App from "ui/App";

render(() => <App />, document.getElementById("ln-root")!);