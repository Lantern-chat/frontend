import { createSignal, JSX } from "solid-js";

import "./spoiler.scss";
export function Spoiler(props: { children: JSX.Element }) {
    let [visible, setVisible] = createSignal(false);

    return (
        <span
            onClick={() => setVisible(true)}
            className="spoiler"
            classList={{
                'visible': visible(),
                'hidden': !visible(),
            }}
            title={visible() ? void 0 : "Click to reveal spoiler"}
        >
            {props.children}
        </span>
    )
}