import React, { createContext } from "react";
import { TinyEventEmitter } from "./_event";
import * as i18n from "ui/i18n";

// The "Context" here is a single function that doesn't change
// Instead, client users are expected to subscribe to changes via `.sub()`
export const ClientContext = createContext<() => ClientModel>(null!);
ClientContext.displayName = "ClientContext";

const LANG_LOCALSTORAGE_KEY = "lang";

import { GatewayCommandOp } from "client/worker";
import { genDarkTheme, genLightTheme, IThemeContext, setTheme as setRealTheme } from "client/theme";

export class ClientModel extends TinyEventEmitter {
    currentLanguage: i18n.Language = "en"; // default to English
    theme: IThemeContext;

    constructor() {
        super();
        this.setup_i18n();
        this.theme = {
            is_light: false,
            temperature: 7500,
            setTheme: (theme: IThemeContext) => { }
        };

        setRealTheme(genDarkTheme(this.theme.temperature), false, false);
    }

    setTheme(theme: IThemeContext) {
        this.theme = theme;
        if(!this.theme.is_light) {
            setRealTheme(genDarkTheme(this.theme.temperature), true, this.theme.is_light);
        } else {
            setRealTheme(genLightTheme(this.theme.temperature), true, this.theme.is_light);
        }
    }

    setup_i18n() {
        let savedLang = localStorage.getItem(LANG_LOCALSTORAGE_KEY) as i18n.Language | null;

        // if there is no saved language or the saved language isn't available
        if(!savedLang || i18n.LANGS.indexOf(savedLang) === -1) {
            // if a browser locale is available, try to use it
            let browserLocale = navigator?.languages ? navigator.languages[0] : this.currentLanguage;

            let bestMatch = this.currentLanguage;
            for(let lang of i18n.LANGS) {
                if(browserLocale.startsWith(lang)) {
                    bestMatch = lang;
                    if(browserLocale === lang) {
                        break;
                    }
                }
            }

            savedLang = bestMatch;
        }

        // TODO: Add one-time modal popup to ask if they want to switch to the browser language
        // and make sure to present the question in both the current/default language and the target
        // browser language.

        this.set_lang(savedLang);
    }

    set_lang(language: i18n.Language) {
        this.currentLanguage = language;
        localStorage.setItem(LANG_LOCALSTORAGE_KEY, this.currentLanguage);
        i18n.preload(this.currentLanguage);
    }

    start() {
        // TODO:
        // 1. Read in configuration data from cookies and/or localstorage
        // 2. Connect to each saved party and authenticate
        // 3. Load party state
        // 4. If no parties are valid, trigger the login screen
        // 5. If parties, load any last-viewed party and go to it or default to DMs
    }
}