import type { JSXElement } from "solid-js";
import { useI18nContext } from "ui/i18n/i18n-solid";

// avoid using extra signals by just doing the mutation directly
function on_spoiler_click(e: MouseEvent) {
    let el = e.currentTarget as HTMLSpanElement;
    el.classList.toggle("hidden", false);
    el.title = "";
    el.removeEventListener("click", on_spoiler_click);
}

import "./spoiler.scss";
export function Spoiler(props: { children: JSXElement }) {
    let { LL } = useI18nContext();

    return (
        <span
            onClick={on_spoiler_click}
            class="spoiler hidden"
            title={LL().main.SPOILER_TITLE()}
        >
            {/* @once */props.children}
        </span>
    )
}