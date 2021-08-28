import { useEffect, useState } from "react";
import { StorageKey } from "state/storage";
import { LANGS, Language, ILocaleContext } from "ui/i18n";

let initialLocale = localStorage.getItem(StorageKey.LOCALE) as Language;
if(!LANGS.includes(initialLocale)) {
    initialLocale = "en";
}

export function createLocale(): ILocaleContext {
    let [locale, setLocale] = useState<ILocaleContext>({ lang: initialLocale, setLocale: (locale: Language) => { } });
    locale.setLocale = (lang: Language) => setLocale({ ...locale, lang });

    useEffect(() => {
        if(locale.lang !== localStorage.getItem(StorageKey.LOCALE)) {
            localStorage.setItem(StorageKey.LOCALE, locale.lang);
        }
    }, [locale.lang]);

    return locale;
}