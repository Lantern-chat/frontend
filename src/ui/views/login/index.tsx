import { createMemo, createSignal, Show } from "solid-js";

import { setSession } from "state/commands";

import * as i18n from "ui/i18n";
import { I18N, Translation } from "ui/i18n";

import { useDispatch } from "solid-mutant";
import type { RootState, Action } from "state/root";
import { CLIENT } from "state/global";

import { createReducer } from "ui/hooks/createReducer";

//import { timeout } from "lib/util";
import { Spinner } from "ui/components/common/spinners/spinner";
//import { VectorIcon } from "ui/components/common/icon";
import { FormGroup, FormLabel, FormInput } from "ui/components/form";
import { Modal, FullscreenModal } from "ui/components/modal";

import { Link } from "ui/components/history";

import { validateEmail } from "lib/validation";

import { ApiError, ApiErrorCode } from "client-sdk/src/api/error";
import { UserLogin } from "client-sdk/src/api/commands/user";
import { DriverError } from "client-sdk/src/driver";

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
    is_logging_in: boolean,
    totp_required: boolean,
    have_2fa: boolean,
}

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
    value?: string,
    type: LoginActionType,
}

function login_state_reducer(state: LoginState, { value, type }: LoginAction): LoginState {
    switch(type) {
        case LoginActionType.UpdateEmail: {
            return { ...state, email: value! };
        }
        case LoginActionType.UpdatePass: {
            return { ...state, pass: value! };
        }
        case LoginActionType.UpdatedTOTP: {
            return { ...state, totp: value! };
        }
        case LoginActionType.Login: {
            return { ...state, is_logging_in: true };
        }
        case LoginActionType.NoLogin: {
            return { ...state, is_logging_in: false };
        }
        case LoginActionType.TOTPRequired: {
            return { ...state, totp_required: true, have_2fa: true };
        }
        case LoginActionType.IHave2FA: {
            return { ...state, have_2fa: !state.have_2fa };
        }
        default: return state;
    }
}

import "./login.scss";
export default function LoginView() {
    document.title = "Login";

    let dispatch = useDispatch<RootState, Action>();

    // TODO: Don't bother with reducer?
    let [state, form_dispatch] = createReducer(login_state_reducer, {
        email: "",
        pass: "",
        totp: "",
        is_logging_in: false,
        totp_required: false,
        have_2fa: false,
    });

    let [errorMsg, setErrorMsg] = createSignal<string | null>(null);

    let on_submit = async (e: Event) => {
        e.preventDefault();

        if(state.is_logging_in) return;

        form_dispatch({ type: LoginActionType.Login, value: '' });

        try {
            dispatch(setSession(await CLIENT.execute(UserLogin({
                form: {
                    email: state.email,
                    password: state.pass,
                    totp: state.totp,
                }
            }))));
        } catch(e) {
            let msg;
            if(e instanceof ApiError) {
                if(e.code == ApiErrorCode.TOTPRequired) {
                    return form_dispatch({ type: LoginActionType.TOTPRequired, value: '' });
                } else {
                    msg = e.message;
                }
            } else if(e instanceof DriverError) {
                msg = "Network error: " + e.msg();
            } else {
                msg = "Unknown Error";
            }

            setErrorMsg(msg);
            form_dispatch({ type: LoginActionType.NoLogin, value: '' });
        }
    };

    let on_input = (e: InputEvent, type: LoginActionType) => form_dispatch({ type, value: (e.target as HTMLInputElement).value });

    let on_email_change = (e: InputEvent) => on_input(e, LoginActionType.UpdateEmail),
        on_password_change = (e: InputEvent) => on_input(e, LoginActionType.UpdatePass),
        on_totp_change = (e: InputEvent) => on_input(e, LoginActionType.UpdatedTOTP);

    let mfa_toggle = createMemo(() => {
        let mfa_toggle_text = (state.have_2fa ? "Don't have" : "Have") + " a 2FA Code?",
            mfa_toggle_flavor = (state.have_2fa ? "hide" : "show");

        return (
            <div id="mfa_toggle"
                title={`${mfa_toggle_text} Click here to ${mfa_toggle_flavor} the input.`}
                onClick={() => form_dispatch({ type: LoginActionType.IHave2FA, value: '' })}
                textContent={mfa_toggle_text}
            />
        );
    });

    let valid_email = createMemo(() => validateEmail(state.email));

    return (
        <form className="ln-form ln-login-form ui-text" onSubmit={on_submit}>
            <div id="title">
                <h2><I18N t={Translation.LOGIN} /></h2>
            </div>

            <Show when={state.totp_required}>
                <FullscreenModal style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>
                    <div className="ln-center-standalone" style={{ color: 'white' }}>
                        TOTP Required
                    </div>
                </FullscreenModal>
            </Show>

            <FormGroup>
                <FormLabel htmlFor="email"><I18N t={Translation.EMAIL_ADDRESS} /></FormLabel>
                <FormInput value={state.email} type="email" name="email" placeholder="example@example.com" required isValid={state.email ? valid_email() : null}
                    onInput={on_email_change} />
            </FormGroup>

            <FormGroup>
                <FormLabel htmlFor="password">
                    <I18N t={Translation.PASSWORD} />
                </FormLabel>
                <FormInput value={state.pass} type="password" name="password" placeholder="password" required
                    onInput={on_password_change} />

                <Show when={!state.have_2fa}>
                    {mfa_toggle()}
                </Show>
            </FormGroup>

            <Show when={state.have_2fa}>
                <FormGroup>
                    <FormLabel htmlFor="totp">
                        <span>2FA Code</span>
                    </FormLabel>

                    <FormInput id="totp_input" value={state.totp} type="number" name="totp" placeholder="2FA Code" min="0" pattern="[0-9]*" required
                        onInput={on_totp_change} />

                    {mfa_toggle()}
                </FormGroup>
            </Show>

            <Show when={errorMsg()}>
                <FormGroup>
                    <div className="ln-login-error">
                        Login Error: {errorMsg()}
                    </div>
                </FormGroup>
            </Show>

            <hr />

            <FormGroup>
                <div style={{ display: 'flex', padding: '0 1em' }}>
                    <button
                        className="ln-btn ui-text"
                        classList={{ 'ln-btn--loading-icon': state.is_logging_in }}
                        style={{ 'margin-right': 'auto' }}
                        onClick={() => setErrorMsg(null)}
                    >
                        <Show when={state.is_logging_in} fallback="Login">
                            <Spinner size="2em" />
                        </Show>
                    </button>

                    <Link className="ln-btn" href="/register">Register</Link>
                </div>
            </FormGroup>
        </form>
    );
}