import { createSignal, JSX } from "solid-js";
import { useI18nContext } from "ui/i18n/i18n-solid";

import "./spoiler.scss";
export function Spoiler(props: { children: JSX.Element }) {
    let [visible, setVisible] = createSignal(false);

    let { LL } = useI18nContext();

    return (
        <span
            onClick={() => setVisible(true)}
            className="spoiler"
            classList={{
                'visible': visible(),
                'hidden': !visible(),
            }}
            title={visible() ? void 0 : LL().main.SPOILER_TITLE()}
        >
            {props.children}
        </span>
    )
}