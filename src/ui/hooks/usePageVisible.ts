import { Accessor, createRenderEffect, createSignal, onCleanup } from "solid-js";
import { isPageHidden, visibilityChange } from "ui/utils";

export function usePageVisible(): Accessor<boolean> {
    let [visible, setVisible] = createSignal(!isPageHidden());

    createRenderEffect(() => {
        // use visibility events when available
        if(visibilityChange) {
            let listener = () => setVisible(!isPageHidden());
            document.addEventListener(visibilityChange, listener);
            onCleanup(() => document.removeEventListener(visibilityChange!, listener));
        } else {
            let set_visible = () => setVisible(true);
            let set_hidden = () => setVisible(false);

            // otherwise just use blur/focus
            window.addEventListener('blur', set_hidden);
            window.addEventListener('focus', set_visible);

            onCleanup(() => {
                window.removeEventListener('blur', set_hidden);
                window.removeEventListener('focus', set_visible);
            });
        }
    });

    return visible;
}