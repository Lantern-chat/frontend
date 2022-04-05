import { createSelector, For } from "solid-js";
import type { Locales } from "ui/i18n/i18n-types";

export const LanguageSettingsTab = () => {
    return (
        <form className="ln-settings-form">
            <LangPicker />
        </form>
    );
};

import { LANGUAGES, LANGUAGE_KEYS, useLocale } from "ui/i18n";
import { loadLocaleAsync, loadNamespaceAsync } from "ui/i18n/i18n-util.async";

import "./language.scss";
function LangPicker() {
    let { locale, setLocale } = useLocale();

    let selected = createSelector(locale);
    let on_select = async (which: Locales) => {
        await Promise.all([
            loadLocaleAsync(which),
            loadNamespaceAsync(which, 'main')
        ]);

        setLocale(which);
    };

    return (
        <ul className="lang-list">
            <For each={LANGUAGE_KEYS}>
                {key => {
                    let lang = LANGUAGES[key];

                    return (
                        <li
                            className="lang-item"
                            classList={{ selected: selected(key) }}
                            onClick={() => on_select(key as Locales)}
                        >
                            <div className="lang-emoji">{lang.e}</div>
                            <div className="lang-name">{lang.n}</div>
                        </li>
                    )
                }}
            </For>
        </ul>
    )
}