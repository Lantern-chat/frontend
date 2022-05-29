import { createSelector, For } from "solid-js";

import { Locales } from "ui/i18n/i18n-types";
import { LANGUAGES, LANGUAGE_KEYS, useLocale } from "ui/i18n";
import { loadLocaleAsync } from "ui/i18n/i18n-util.async";

import { VectorIcon } from "ui/components/common/icon";
import { TranslateIcon } from "lantern-icons";

import "./lang_widget.scss";
export function LangWidget() {
    let { LL, locale, setLocale } = useLocale();

    let selected = createSelector(locale);

    let on_select = async (which: Locales) => {
        await loadLocaleAsync(which);
        setLocale(which);
    };

    return (
        <div class="ln-lang-widget" title={LL().CHANGE_LANG()}>
            <div class="ln-lang-widget__title-wrapper">
                <div class="ln-lang-widget__title" textContent={LL().CHANGE_LANG()} />

                <div class="ln-lang-widget__icon">
                    <VectorIcon src={TranslateIcon} />
                </div>
            </div>

            <div class="ln-lang-widget__options">
                <ul class="ln-lang-widget__list">
                    <For each={LANGUAGE_KEYS}>
                        {key => {
                            let lang = LANGUAGES[key];

                            return (
                                <li
                                    class="ln-lang-widget__item"
                                    classList={{ selected: selected(key) }}
                                    onClick={() => on_select(key as Locales)}
                                >
                                    <div class="ln-lang-widget__emoji">{lang.e}</div>
                                    <div class="ln-lang-widget__name">{lang.n}</div>
                                </li>
                            )
                        }}
                    </For>
                </ul>
            </div>

        </div>
    );
}