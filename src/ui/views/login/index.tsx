import React, { useState, useMemo, useReducer, useEffect } from "react";

import * as i18n from "ui/i18n";
import { I18N, Translation } from "ui/i18n";

import { Link, Redirect } from "react-router-dom";

import { fetch, XHRMethod } from "client/fetch";
import { useTitle } from "ui/hooks/useTitle";
import { Glyphicon } from "ui/components/common/glyphicon/";
import { FormGroup, FormLabel, FormInput, FormText, FormSelect, FormSelectOption } from "ui/components/form";
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
}

const DEFAULT_LOGIN_STATE: LoginState = {
    email: "",
    pass: "",
    valid_email: null,
};

enum LoginActionType {
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
        default: return state;
    }
}

import "./login.scss";
export default function LoginView() {
    useTitle("Login");

    let [state, dispatch] = useReducer(login_state_reducer, DEFAULT_LOGIN_STATE);
    let [errorMsg, setErrorMsg] = useState<string | null>(null);
    let [redirect, setRedirect] = useState(false);

    let on_submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        fetch.submitFormUrlEncoded({
            url: "/api/v1/user/login",
            method: XHRMethod.POST,
            body: new FormData(e.currentTarget),
        }).then((req) => {
            if(req.status === 200 && req.response.auth != null) {
                localStorage.setItem('user', JSON.stringify({ auth: req.response.auth }));
                setRedirect(true);
            } else {
                setErrorMsg("Unknown Error");
            }
        }).catch((req: XMLHttpRequest) => {
            setErrorMsg(req.response.message);
        })
    };

    if(redirect) {
        return <Redirect to="/" />;
    }


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
                        <button className="ln-btn" style={{ marginRight: 'auto' }}>Login</button>
                        <Link className="ln-btn" to={"/register"} onMouseOver={() => preloadRegister()}>Register</Link>
                    </div>
                </FormGroup>
            </form>
        </>
    );
}