import { createSelector, For } from "solid-js";
import { useI18nContext } from "ui/i18n/i18n-solid";
import type { Locales } from "ui/i18n/i18n-types";

export const LanguageSettingsTab = () => {
    return (
        <form className="ln-settings-form">
            <LangPicker />
        </form>
    );
};

import { LANGUAGES, LANGUAGE_KEYS } from "ui/i18n";
import { loadLocaleAsync, loadNamespaceAsync } from "ui/i18n/i18n-util.async";
import dayjs from "lib/time";

import "./language.scss";
function LangPicker() {
    let { locale, setLocale } = useI18nContext();

    let selected = createSelector(locale);
    let on_select = async (which: Locales) => {
        let lang = LANGUAGES[which];

        await loadLocaleAsync(which);
        await loadNamespaceAsync(which, 'main');

        dayjs.locale(lang.d || which);
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