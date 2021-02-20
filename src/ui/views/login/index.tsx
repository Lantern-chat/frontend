import React, { useState, useMemo, useReducer, useEffect, useContext } from "react";

import * as i18n from "ui/i18n";
import { I18N, Translation } from "ui/i18n";

import { Link, Redirect } from "react-router-dom";

import { timeout } from "client/util";
import { fetch, XHRMethod } from "client/fetch";
import { useTitle } from "ui/hooks/useTitle";
import { Spinner } from "ui/components/common/spinners/spinner";
//import { Glyphicon } from "ui/components/common/glyphicon";
import { FormGroup, FormLabel, FormInput } from "ui/components/form";
import { Modal } from "ui/components/modal";

import { validateUsername, validatePass, validateEmail } from "client/validation";

var PRELOADED: boolean = false;
function preloadRegister() {
    if(!PRELOADED) {
        import(/* webpackChunkName: 'RegisterView' */ "../register");
        PRELOADED = true;
    }
}

interface LoginState {
    email: string,
    pass: string,
    valid_email: boolean | null,
    is_logging_in: boolean,
}

const DEFAULT_LOGIN_STATE: LoginState = {
    email: "",
    pass: "",
    valid_email: null,
    is_logging_in: false,
};

enum LoginActionType {
    Login,
    NoLogin,
    UpdateEmail,
    UpdatePass,
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
        case LoginActionType.Login: {
            return { ...state, is_logging_in: true };
        }
        case LoginActionType.NoLogin: {
            return { ...state, is_logging_in: false };
        }
        default: return state;
    }
}

import { Session } from "client/session";

import "./login.scss";
export default function LoginView() {
    useTitle("Login");

    let [state, dispatch] = useReducer(login_state_reducer, DEFAULT_LOGIN_STATE);
    let [errorMsg, setErrorMsg] = useState<string | null>(null);
    let [redirect, setRedirect] = useState(false);
    let session = useContext(Session);

    if(redirect) {
        return <Redirect to="/channels/0/0" />;
    }

    let on_submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        dispatch({ type: LoginActionType.Login, value: '' });

        // start preloading
        let main = timeout(import("../main"), 4000).catch(() => { });

        let on_error = (err: string) => {
            setErrorMsg(err);
            dispatch({ type: LoginActionType.NoLogin, value: '' });
        };

        fetch.submitFormUrlEncoded({
            url: "/api/v1/users/login",
            method: XHRMethod.POST,
            body: new FormData(e.currentTarget),
        }).then((req) => {
            if(req.status === 200 && req.response.auth != null) {
                main.then(() => {
                    session.setSession(req.response);
                    setRedirect(true);
                });
            } else {
                on_error("Unknown Error");
            }
        }).catch((req: XMLHttpRequest) => {
            on_error(req.response.message);
        })
    };

    let errorModal;

    if(errorMsg != null) {
        errorModal = (
            <Modal>
                <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, zIndex: 'inherit', backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>
                    <div className="ln-center-standalone" style={{ color: 'white' }}>
                        {errorMsg}
                        <button onClick={() => setErrorMsg(null)}>Close</button>
                    </div>
                </div>
            </Modal>
        );
    }

    return (
        <>
            <form className="ln-form ln-login-form" onSubmit={on_submit}>
                <div id="title">
                    <h2><I18N t={Translation.LOGIN} /></h2>
                </div>

                {errorModal}

                <FormGroup>
                    <FormLabel htmlFor="email"><I18N t={Translation.EMAIL_ADDRESS} /></FormLabel>
                    <FormInput value={state.email} type="text" name="email" placeholder="example@example.com" required isValid={state.valid_email}
                        onChange={e => dispatch({ type: LoginActionType.UpdateEmail, value: e.currentTarget.value })} />
                </FormGroup>

                <FormGroup>
                    <FormLabel htmlFor="password">
                        <I18N t={Translation.PASSWORD} />
                    </FormLabel>
                    <FormInput value={state.pass} type="password" name="password" placeholder="password" required
                        onChange={e => dispatch({ type: LoginActionType.UpdatePass, value: e.currentTarget.value })} />
                </FormGroup>

                <hr />

                <FormGroup>
                    <div style={{ display: 'flex', padding: '0 1em' }}>
                        <button className={state.is_logging_in ? 'ln-btn ln-btn--loading-icon' : 'ln-btn'} style={{ marginRight: 'auto' }}>
                            {state.is_logging_in ? <Spinner size="2em" /> : "Login"}
                        </button>
                        <Link className="ln-btn" to={"/register"} onMouseOver={() => preloadRegister()}>Register</Link>
                    </div>
                </FormGroup>
            </form>
        </>
    );
}