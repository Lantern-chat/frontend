import { render } from "solid-js/web";

import "lib/polyfills";

import "ui/styles/root.scss";
import "ui/styles/layout.scss";

import App from "ui/App";

render(() => <App />, document.getElementById("ln-root")!);