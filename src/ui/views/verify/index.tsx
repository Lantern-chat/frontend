import React, { useState, useMemo, useReducer, useEffect, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch } from "state/actions";

import { RootState } from "state/root";

import * as i18n from "ui/i18n";
import { I18N, Translation } from "ui/i18n";

//import { timeout } from "lib/util";
import { fetch, XHRMethod } from "lib/fetch";
import { useTitle } from "ui/hooks/useTitle";
import { Spinner } from "ui/components/common/spinners/spinner";
//import { Glyphicon } from "ui/components/common/glyphicon";
import { FormGroup, FormLabel, FormInput } from "ui/components/form";

import { Link } from "ui/components/history";

var PRELOADED_LOGIN: boolean = false;
function preloadLogin() {
    if(!PRELOADED_LOGIN) {
        import("../login");
        PRELOADED_LOGIN = true;
    }
}
var PRELOADED_MAIN: boolean = false;
function preloadMain() {
    if(!PRELOADED_MAIN) {
        import("../main");
        PRELOADED_MAIN = true;
    }
}

import "../login/login.scss"
import "./verify.scss";
import { DEFAULT_LOGGED_IN_CHANNEL } from "state/global";
export default function VerifyView() {
    useTitle("Verifying Email");

    let is_logged_in = useSelector((state: RootState) => state.user.session != null);

    let preload, href, msg;
    if(is_logged_in) {
        preload = preloadMain;
        href = DEFAULT_LOGGED_IN_CHANNEL;
        msg = "Go to Lantern";
    } else {
        preload = preloadLogin;
        href = "/login";
        msg = "Go to Login";
    }

    return (
        <form className="ln-form ln-login-form">
            <div id="title">
                <h3>Verifying...</h3>
            </div>

            <FormGroup>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <Link href={href} className="ln-btn" onMouseOver={preload} >{msg}</Link>
                </div>
            </FormGroup>
        </form>
    )
}

if(__DEV__) {
    VerifyView.displayName = "VerifyView";
}