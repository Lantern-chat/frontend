import { createEffect, createMemo, createSignal, For, Index, Show } from "solid-js";

import { createController } from "ui/hooks/createController";

import { setSession } from "state/commands";
import { selectPrefsFlag } from "state/selectors/prefs";
import { UserPreferenceFlags } from "state/models";

import dayjs from "lib/time";

import * as i18n from "ui/i18n";
import { I18N, Translation } from "ui/i18n";

import { useDispatch } from "solid-mutant";
import type { RootState, Action } from "state/root";
import { useRootSelector } from "state/root";
import { CLIENT } from "state/global";

import { createReducer } from "ui/hooks/createReducer";

import { Link } from "ui/components/history";

import { VectorIcon } from "ui/components/common/icon";
//import { Tooltip } from "ui/components/common/tooltip";
import { Spinner } from "ui/components/common/spinners/spinner";
import { FormGroup, FormLabel, FormInput, FormText, FormSelect, FormSelectOption, FormSelectGroup } from "ui/components/form";
import { HCaptchaController, HCaptcha } from "ui/components/hcaptcha";

import { validateUsername, validatePass, validateEmail } from "lib/validation";

import { ApiError, ApiErrorCode } from "client-sdk/src/api/error";
import { UserRegister } from "client-sdk/src/api/commands/user";
import { DriverError } from "client-sdk/src/driver";

//import { calcPasswordStrength } from "./password";

import type { ZXCVBNResult } from "zxcvbn";

type zxcvbn_fn = (input: string) => ZXCVBNResult;

var zxcvbn: { zxcvbn: zxcvbn_fn } | (() => Promise<{ default: zxcvbn_fn }>) = () => import('zxcvbn');

// var PRELOADED: boolean = false;
// function preloadLogin() {
//     if(!PRELOADED) {
//         import(/* webpackChunkName: 'LoginView' */ "../login");
//         PRELOADED = true;
//     }
// }


/*
function chunkString(str: string, length: number) {
    return str.match(new RegExp('.{1,' + length + '}', 'g'));
}

const PASSWORDS = require("../../../../data/filter.json");

const fingerprint_length = PASSWORDS._fingerprintLength;
const chars_per_entry = fingerprint_length * PASSWORDS._element_size;
PASSWORDS._filter = chunkString(PASSWORDS._filter, chars_per_entry)?.map((e) => {
    let _elements = chunkString(e, fingerprint_length)?.map((f) => f.charAt(0) === '.' ? null : f);
    return {
        type: "Bucket",
        _size: PASSWORDS._element_size,
        _elements,
    }
});

import { CuckooFilter } from "bloom-filters";
const PASSWORD_FILTER: CuckooFilter = (CuckooFilter as any).fromJSON(PASSWORDS);
*/

const YEARS: string[] = [];
const CURRENT_YEAR = dayjs().year();
for(let i = 0; i < 100; i++) {
    YEARS.push((CURRENT_YEAR - 13 - i).toString());
}

interface IDob {
    y?: number,
    m?: number,
    d?: number | null,
}

interface RegisterState {
    dob: IDob,
    days: number,
    email: string,
    user: string,
    pass: string,
    is_registering: boolean,
}

enum RegisterActionType {
    UpdateEmail,
    UpdateUser,
    UpdatePass,
    UpdatePassStrength,
    UpdateYear,
    UpdateMonth,
    UpdateDay,
    Verify,
    Register,
    NoRegister,
}

interface RegisterAction {
    value?: string,
    type: RegisterActionType,
}

function calculateDays(dob: IDob): number {
    let num_days = dayjs(0).year(dob.y || 1970).month((dob.m || 12) - 1).daysInMonth();
    dob.d = (dob.d == null || num_days < dob.d) ? null : dob.d;
    return num_days;
}

function calc_pass_strength(pwd: string): number {
    return typeof zxcvbn === 'object' ? Math.max(zxcvbn.zxcvbn(pwd).score, 1) : 0;
}

function register_state_reducer(state: RegisterState, { value, type }: RegisterAction): RegisterState {
    switch(type) {
        case RegisterActionType.UpdateEmail: {
            return { ...state, email: value! };
        }
        case RegisterActionType.UpdateUser: {
            value = value!.trimStart();
            return { ...state, user: value };
        }
        case RegisterActionType.UpdatePass: {
            return { ...state, pass: value! };
        }
        case RegisterActionType.UpdateYear: {
            let dob = { ...state.dob, y: parseInt(value!) };
            return { ...state, dob, days: calculateDays(dob) };
        }
        case RegisterActionType.UpdateMonth: {
            let dob = { ...state.dob, m: parseInt(value!) };
            return { ...state, dob, days: calculateDays(dob) };
        }
        case RegisterActionType.UpdateDay: {
            let dob = { ...state.dob, d: parseInt(value!) };
            return { ...state, dob };
        }
        case RegisterActionType.Register: {
            return { ...state, is_registering: true };
        }
        case RegisterActionType.NoRegister: {
            return { ...state, is_registering: false };
        }
        default: return state;
    }
}

import { CircleEmptyInfoIcon } from "lantern-icons";

var SETUP_THEN = false;

const HCAPTCHA_ERRORS = {
    "rate-limited": "Too Many hCaptcha Requests",
    "network-error": "hCaptcha Network Error",
    "invalid-data": "Invalid hCaptcha Data",
    "challenge-error": "hCaptcha Challenge Error",
    "challenge-closed": "hCaptcha Challenge Closed",
    "challenge-expired": "hCaptcha Challenge Expired",
    "missing-captcha": "Missing Captcha",
    "invalid-captcha-id": "Invalid hCaptcha ID",
    "internal-error": "Internal hCaptcha Error",
};

import "../login/login.scss";
import "./register.scss";
export default function RegisterView() {
    document.title = "Register";

    let dispatch = useDispatch<RootState, Action>();

    let [hcaptcha, setHCaptchaController] = createController<HCaptchaController>();

    let [state, form_dispatch] = createReducer(register_state_reducer, {
        email: "",
        user: "",
        pass: "",
        dob: {},
        days: 31,
        is_registering: false,
    });

    let [errorMsg, setErrorMsg] = createSignal<string | null>(null);
    let is_light_theme = useRootSelector(selectPrefsFlag(UserPreferenceFlags.LightMode));

    createEffect(() => {
        if(!SETUP_THEN && typeof zxcvbn == 'function') {
            zxcvbn().then(mod => {
                zxcvbn = { zxcvbn: mod.default };
                form_dispatch({ type: RegisterActionType.UpdatePassStrength, value: "" });
            });
            SETUP_THEN = true;
        }
    });

    let valid_email = createMemo(() => state.email ? validateEmail(state.email) : null);
    let valid_user = createMemo(() => state.user ? validateUsername(state.user) : null);
    let valid_pass = createMemo(() => state.pass ? validatePass(state.pass) : null);

    let passwordClass = createMemo(() => {
        let pass_strength = state.pass && valid_pass() ? calc_pass_strength(state.pass) : 0;

        let passwordClass: string = 'ln-password-';
        switch(pass_strength) {
            case 1: { passwordClass += 'weak'; break; }
            case 2: { passwordClass += 'mid'; break; }
            case 3: { passwordClass += 'strong'; break; }
            case 4: { passwordClass += 'vstrong'; break; }
            default: passwordClass += 'none';
        }
        return passwordClass;
    });

    let on_submit = async (e: Event) => {
        e.preventDefault();

        let h;
        if(state.is_registering || !(h = hcaptcha())) return;

        form_dispatch({ type: RegisterActionType.Register, value: '' });

        let on_error = (err: string) => {
            setErrorMsg(err);
            form_dispatch({ type: RegisterActionType.NoRegister, value: '' });
        };

        let res;
        try {
            res = await h.execute({ async: true });
        } catch(e) {
            on_error(HCAPTCHA_ERRORS[e] || "Unknown Error");
            return;
        }

        try {
            dispatch(setSession(await CLIENT.execute(UserRegister({
                form: {
                    email: state.email,
                    username: state.user,
                    password: state.pass,
                    year: state.dob.y!,
                    month: state.dob.m!,
                    day: state.dob.d!,
                    token: res.response,
                }
            }))));
        } catch(req) {
            let msg;
            if(e instanceof ApiError) {
                msg = e.message;
            } else if(e instanceof DriverError) {
                msg = "Network error: " + e.msg();
            } else {
                msg = "Unknown Error";
            }
            on_error(msg);
        }
    };

    let on_change = (e: Event, type: RegisterActionType) => form_dispatch({ type, value: (e.currentTarget as HTMLInputElement).value });

    let on_email_change = (e: InputEvent) => on_change(e, RegisterActionType.UpdateEmail),
        on_username_change = (e: InputEvent) => on_change(e, RegisterActionType.UpdateUser),
        on_password_change = (e: InputEvent) => on_change(e, RegisterActionType.UpdatePass),
        on_year_change = (e: Event) => on_change(e, RegisterActionType.UpdateYear),
        on_month_change = (e: Event) => on_change(e, RegisterActionType.UpdateMonth),
        on_day_change = (e: Event) => on_change(e, RegisterActionType.UpdateDay);

    return (
        <form className="ln-form ln-login-form ln-register-form ui-text" onSubmit={on_submit}>
            <div id="title">
                <h2><I18N t={Translation.REGISTER} /></h2>
            </div>

            <FormGroup>
                <FormLabel htmlFor="email"><I18N t={Translation.EMAIL_ADDRESS} /></FormLabel>
                <FormInput value={state.email} type="email" name="email" placeholder="example@example.com" required isValid={valid_email()}
                    onInput={on_email_change} />
            </FormGroup>

            <FormGroup>
                <FormLabel htmlFor="username"><I18N t={Translation.USERNAME} /></FormLabel>
                <FormInput value={state.user} type="text" name="username" placeholder="username" required isValid={valid_user()}
                    onInput={on_username_change} />
            </FormGroup>

            <FormGroup>
                <FormLabel htmlFor="password">
                    <I18N t={Translation.PASSWORD} />
                    <span className="ln-tooltip" style={{ marginLeft: '0.2em' }}>
                        <VectorIcon src={CircleEmptyInfoIcon} />
                    </span>
                </FormLabel>
                <FormInput type="password" name="password" placeholder="password" required isValid={valid_pass()}
                    className={passwordClass()} onInput={on_password_change} />
                <FormText>
                    Password must be at least 8 characters long and contain at least one number or one special character.
                </FormText>
            </FormGroup>

            <FormGroup>
                <FormLabel><I18N t={Translation.DATE_OF_BIRTH} /></FormLabel>
                <FormSelectGroup>
                    <FormSelect name="year" required value={state.dob.y || ""} onChange={on_year_change}>
                        <I18N t={Translation.YEAR} render={(value: string) => <option disabled hidden value="">{value}</option>} />
                        <For each={YEARS}>
                            {year => <option value={year}>{year}</option>}
                        </For>
                    </FormSelect>

                    <FormSelect name="month" required value={state.dob.m != null ? state.dob.m : ""} onChange={on_month_change}>
                        <I18N t={Translation.MONTH} render={(value: string) => <option disabled hidden value="">{value}</option>} />
                        <For each={dayjs.months()}>
                            {(month, i) => <option value={i() + 1}>{month}</option>}
                        </For>
                    </FormSelect>

                    <FormSelect name="day" required onChange={on_day_change}
                        value={state.dob.d == null ? "" : state.dob.d}>
                        <I18N t={Translation.DAY} render={(value: string) => <option disabled hidden value="">{value}</option>} />

                        <Index each={new Array(state.days)}>
                            {(_, i) => <option value={i + 1}>{(i + 1).toString()}</option>}
                        </Index>
                    </FormSelect>
                </FormSelectGroup>
            </FormGroup>

            <Show when={errorMsg()}>
                <FormGroup>
                    <div className="ln-login-error">
                        Registration Error: {errorMsg()}!
                    </div>
                </FormGroup>
            </Show>

            <hr />

            <FormGroup>
                <div style={{ display: 'flex', padding: '0 1em' }}>
                    <button
                        className="ln-btn ui-text"
                        classList={{ 'ln-btn--loading-icon': state.is_registering }}
                        style={{ "margin-right": 'auto' }}
                        onClick={() => setErrorMsg(null)}
                    >
                        <Show when={state.is_registering} fallback="Register">
                            <Spinner size="2em" />
                        </Show>

                        <HCaptcha
                            setController={setHCaptchaController}
                            params={{
                                size: "invisible",
                                theme: is_light_theme() ? "light" : "dark",
                                sitekey: "7a2a9dd4-1fa3-44cf-aa98-147052e8ea25"
                            }}
                        />
                    </button>


                    <Link href="/login" className="ln-btn">Go to Login</Link>
                </div>
            </FormGroup>

            <FormGroup>
                <FormText>
                    By registering, you agree to our... this will be filled in later.
                </FormText>

                <FormText>
                    This site is protected by hCaptcha and its <a target="_blank" href="https://hcaptcha.com/privacy">Privacy Policy</a> and <a target="_blank" href="https://hcaptcha.com/terms">Terms of Service</a> apply.
                </FormText>
            </FormGroup>
        </form>
    );
}

if(__DEV__) {
    RegisterView.displayName = "RegisterView";
}