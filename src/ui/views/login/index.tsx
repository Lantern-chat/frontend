import classNames from "classnames";
import React, { useState, useMemo, useReducer, useEffect, useContext, useCallback } from "react";

import { useDispatch } from "react-redux";
import { Dispatch } from "state/actions";
import { setSession } from "state/commands";
import { ErrorCode } from "state/models";

import * as i18n from "ui/i18n";
import { I18N, Translation } from "ui/i18n";

//import { timeout } from "lib/util";
import { fetch, XHRMethod } from "lib/fetch";
import { useTitle } from "ui/hooks/useTitle";
import { Spinner } from "ui/components/common/spinners/spinner";
//import { Glyphicon } from "ui/components/common/glyphicon";
import { FormGroup, FormLabel, FormInput } from "ui/components/form";
import { Modal, FullscreenModal } from "ui/components/modal";

import { Link } from "ui/components/history";

import { validateEmail } from "lib/validation";

//var PRELOADED: boolean = false;
//function preloadRegister() {
//    if(!PRELOADED) {
//        import(/* webpackChunkName: 'RegisterView' */ "../register");
//        PRELOADED = true;
//    }
//}

interface LoginState {
    email: string,
    pass: string,
    totp: string,
    valid_email: boolean | null,
    is_logging_in: boolean,
    totp_required: boolean,
    have_2fa: boolean,
}

const DEFAULT_LOGIN_STATE: LoginState = {
    email: "",
    pass: "",
    totp: "",
    valid_email: null,
    is_logging_in: false,
    totp_required: false,
    have_2fa: false,
};

enum LoginActionType {
    Login,
    NoLogin,
    UpdateEmail,
    UpdatePass,
    UpdatedTOTP,
    TOTPRequired,
    IHave2FA,
}

interface LoginAction {
    value: string,
    type: LoginActionType,
}

function login_state_reducer(state: LoginState, { value, type }: LoginAction): LoginState {
    switch(type) {
        case LoginActionType.UpdateEmail: {
            return { ...state, email: value, valid_email: validateEmail(value) };
        }
        case LoginActionType.UpdatePass: {
            return { ...state, pass: value };
        }
        case LoginActionType.UpdatedTOTP: {
            return { ...state, totp: value };
        }
        case LoginActionType.Login: {
            return { ...state, is_logging_in: true };
        }
        case LoginActionType.NoLogin: {
            return { ...state, is_logging_in: false };
        }
        case LoginActionType.TOTPRequired: {
            return { ...state, totp_required: true };
        }
        case LoginActionType.IHave2FA: {
            return { ...state, have_2fa: !state.have_2fa };
        }
        default: return state;
    }
}

import "./login.scss";
export default function LoginView() {
    useTitle("Login");

    let dispatch = useDispatch<Dispatch>();

    let [state, form_dispatch] = useReducer(login_state_reducer, DEFAULT_LOGIN_STATE);
    let [errorMsg, setErrorMsg] = useState<string | null>(null);

    let on_submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if(state.is_logging_in) return;

        form_dispatch({ type: LoginActionType.Login, value: '' });

        // start preloading and ensure reducers are replaced
        let main = import("../main");

        let on_error = (err: string) => {
            setErrorMsg(err);
            form_dispatch({ type: LoginActionType.NoLogin, value: '' });
        };

        fetch.submitFormUrlEncoded({
            url: "/api/v1/user/@me",
            method: XHRMethod.POST,
            body: new FormData(e.currentTarget),
        }).then((req) => {
            if(req.status == 201 && req.response.auth != null) {
                main.then(() => dispatch(setSession(req.response)));
            } else {
                on_error("Unknown Error: " + req.status);

                if(__DEV__) {
                    console.error("Missing auth field in response: ", req);
                }
            }
        }).catch((req: XMLHttpRequest) => {
            try {
                if(req.status == 401 && req.response.code == ErrorCode.TOTPRequired) {
                    form_dispatch({ type: LoginActionType.TOTPRequired, value: '' });
                } else {
                    let response = req.response;
                    if(typeof response === 'string') {
                        response = JSON.parse(response);
                    }
                    on_error(response.message);
                }
            } catch(e) {
                on_error("Unknown error: " + req.status);

                if(__DEV__) {
                    console.error("Missing JSON in error response?", e, req);
                }
            }
        })
    };

    let totp_modal;

    if(state.totp_required) {
        totp_modal = (
            <FullscreenModal style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>
                <div className="ln-center-standalone" style={{ color: 'white' }}>
                    TOTP Required
                </div>
            </FullscreenModal>
        );
    }

    let on_email_change = useCallback(e => form_dispatch({ type: LoginActionType.UpdateEmail, value: e.currentTarget.value }), []),
        on_password_change = useCallback(e => form_dispatch({ type: LoginActionType.UpdatePass, value: e.currentTarget.value }), []),
        on_totp_change = useCallback(e => form_dispatch({ type: LoginActionType.UpdatedTOTP, value: e.currentTarget.value }), []);

    let mfa_toggle_text = (state.have_2fa ? "Don't have" : "Have") + " a 2FA Code?",
        mfa_toggle_flavor = (state.have_2fa ? "hide" : "show"),
        mfa_toggle = (
            <div id="mfa_toggle"
                title={`${mfa_toggle_text} Click here to ${mfa_toggle_flavor} the input.`}
                onClick={() => form_dispatch({ type: LoginActionType.IHave2FA, value: '' })}
            >
                {mfa_toggle_text}
            </div>
        );

    return (
        <form className="ln-form ln-login-form ui-text" onSubmit={on_submit}>
            <div id="title">
                <h2><I18N t={Translation.LOGIN} /></h2>
            </div>

            {totp_modal}

            <FormGroup>
                <FormLabel htmlFor="email"><I18N t={Translation.EMAIL_ADDRESS} /></FormLabel>
                <FormInput value={state.email} type="email" name="email" placeholder="example@example.com" required isValid={state.valid_email}
                    onChange={on_email_change} />
            </FormGroup>

            <FormGroup>
                <FormLabel htmlFor="password">
                    <I18N t={Translation.PASSWORD} />
                </FormLabel>
                <FormInput value={state.pass} type="password" name="password" placeholder="password" required
                    onChange={on_password_change} />

                {!state.have_2fa && mfa_toggle}
            </FormGroup>

            {state.have_2fa && (
                <FormGroup>
                    <FormLabel htmlFor="totp">
                        <span>2FA Code</span>
                    </FormLabel>
                    <FormInput id="totp_input" value={state.totp} type="number" name="totp" placeholder="2FA Code" min="0" pattern="[0-9]*" required
                        onChange={on_totp_change} />

                    {mfa_toggle}
                </FormGroup>
            )}

            {errorMsg && (
                <FormGroup>
                    <div className="ln-login-error">
                        Login Error: {errorMsg}
                    </div>
                </FormGroup>
            )}

            <hr />

            <FormGroup>
                <div style={{ display: 'flex', padding: '0 1em' }}>
                    <button
                        className={classNames('ln-btn ui-text', { 'ln-btn--loading-icon': state.is_logging_in })}
                        style={{ marginRight: 'auto' }}
                        onClick={() => setErrorMsg(null)}
                    >
                        {state.is_logging_in ? <Spinner size="2em" /> : "Login"}
                    </button>


                    <Link className="ln-btn" href="/register">Register</Link>
                </div>
            </FormGroup>
        </form>
    );
}

if(__DEV__) {
    LoginView.displayName = "LoginView";
}