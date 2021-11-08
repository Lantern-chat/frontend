import React, { useState, useMemo, useReducer, useEffect, useContext } from "react";
import { useDispatch } from "react-redux";
import { Dispatch } from "state/actions";

import * as i18n from "ui/i18n";
import { I18N, Translation } from "ui/i18n";

//import { timeout } from "lib/util";
import { fetch, XHRMethod } from "lib/fetch";
import { useTitle } from "ui/hooks/useTitle";
import { Spinner } from "ui/components/common/spinners/spinner";
//import { Glyphicon } from "ui/components/common/glyphicon";
import { FormGroup, FormLabel, FormInput } from "ui/components/form";
import { Modal } from "ui/components/modal";

import { Link } from "ui/components/history";

var PRELOADED: boolean = false;
function preloadLogin() {
    if(!PRELOADED) {
        import(/* webpackChunkName: 'LoginView' */ "../login");
        PRELOADED = true;
    }
}

import "../login/login.scss"
export default function ResetView() {
    useTitle("Reset Password");

    return (
        <form className="ln-form ln-login-form">
            <div id="title">
                <h3>Reset Password</h3>
            </div>

            <FormGroup>
                <div style={{ display: 'flex', padding: '0 1em' }}>
                    <Link href="/login" className="ln-btn" onMouseOver={() => preloadLogin()} >Go to Login</Link>
                </div>
            </FormGroup>
        </form>
    )
}

if(__DEV__) {
    ResetView.displayName = "ResetView";
}