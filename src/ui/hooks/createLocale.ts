import { useEffect, useState } from "react";
import { LANGS, Language, ILocaleContext } from "ui/i18n";

let initialLocale = localStorage.getItem('locale') as Language;
if(LANGS.indexOf(initialLocale) === -1) {
    initialLocale = "en";
}

export function createLocale(): ILocaleContext {
    let [locale, setLocale] = useState<ILocaleContext>({ lang: initialLocale, setLocale: (locale: Language) => { } });
    locale.setLocale = (lang: Language) => setLocale({ ...locale, lang });

    useEffect(() => {
        if(locale.lang !== localStorage.getItem('locale')) {
            localStorage.setItem('locale', locale.lang);
        }
    }, [locale.lang]);

    return locale;
}