import { createSelector, createSignal, For, Show } from "solid-js";
import type { Locales } from "ui/i18n/i18n-types";

export const LanguageSettingsTab = () => {
    return (
        <form class="ln-settings-form">
            <LangPicker />
        </form>
    );
};

import { LANGUAGES, LANGUAGE_KEYS, useLocale } from "ui/i18n";
import { loadLocaleAsync, loadNamespaceAsync } from "ui/i18n/i18n-util.async";

import "./language.scss";
import { Spinner } from "ui/components/common/spinners/spinner";
function LangPicker() {
    let { locale, setLocale } = useLocale();

    let [loading, setLoading] = createSignal<undefined | Locales>();

    let on_select = async (which: Locales) => {
        if(loading() || which == locale()) return;

        setLoading(which);

        await Promise.all([
            loadLocaleAsync(which),
            loadNamespaceAsync(which, 'main'),
            //__DEV__ && new Promise(resolve => {
            //    setTimeout(() => resolve(null), 1000000);
            //}),
        ]);

        setLocale(which);
        setLoading();
    };

    let selected = createSelector(locale);
    let selecting = createSelector(loading);

    return (
        <ul class="lang-list">
            <For each={LANGUAGE_KEYS}>
                {key => {
                    let lang = LANGUAGES[key];

                    return (
                        <li
                            class="lang-item"
                            classList={{ selected: selected(key) }}
                            onClick={() => on_select(key as Locales)}
                        >
                            <div class="lang-emoji">{lang.e}</div>
                            <div class="lang-name">{lang.n}</div>
                            <Show when={selecting(key)}>
                                <div class="lang-spinner">
                                    <Spinner size="1.5em"></Spinner>
                                </div>
                            </Show>
                        </li>
                    )
                }}
            </For>
        </ul>
    )
}