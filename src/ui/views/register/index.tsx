import classNames from "classnames";
import React, { useState, useMemo, useReducer, useEffect, useContext, useCallback, useRef } from "react";

import { useDispatch, useSelector } from "react-redux";
import { Dispatch } from "state/actions";
import { setSession } from "state/commands";
import { selectPrefsFlag } from "state/selectors/prefs";
import { UserPreferenceFlags } from "state/models";

import dayjs from "lib/time";

import * as i18n from "ui/i18n";
import { I18N, Translation } from "ui/i18n";

//import { timeout } from "lib/util";
import { fetch, XHRMethod } from "lib/fetch";

import { Link } from "ui/components/history";

import { VectorIcon } from "ui/components/common/icon";
import { Tooltip } from "ui/components/common/tooltip";
import { Spinner } from "ui/components/common/spinners/spinner";
import { FormGroup, FormLabel, FormInput, FormText, FormSelect, FormSelectOption, FormSelectGroup } from "ui/components/form";

import HCaptcha from '@hcaptcha/react-hcaptcha';

import { validateUsername, validatePass, validateEmail } from "lib/validation";

//import { calcPasswordStrength } from "./password";

import { ZXCVBNResult } from "zxcvbn";

type zxcvbn_fn = (input: string) => ZXCVBNResult;

var zxcvbn: { zxcvbn: zxcvbn_fn } | (() => Promise<{ default: zxcvbn_fn }>) = () => import('zxcvbn');

import { useTitle } from "ui/hooks/useTitle";

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
    pass_strength: number,
    valid_email: boolean | null,
    valid_user: boolean | null,
    valid_pass: boolean | null,
    is_registering: boolean,
}

const DEFAULT_REGISTER_STATE: RegisterState = {
    email: "",
    user: "",
    pass: "",
    dob: {},
    days: 31,
    pass_strength: 0,
    valid_email: null,
    valid_user: null,
    valid_pass: null,
    is_registering: false,
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
    value: string | null,
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
            return { ...state, email: value!, valid_email: validateEmail(value!) };
        }
        case RegisterActionType.UpdateUser: {
            value = value!.trimStart();
            return { ...state, user: value, valid_user: validateUsername(value) };
        }
        case RegisterActionType.UpdatePass: {
            let valid_pass = validatePass(value!);

            return {
                ...state,
                pass: value!,
                valid_pass,
                pass_strength: valid_pass ? calc_pass_strength(value!) : 0,
            };
        }
        case RegisterActionType.UpdatePassStrength: {
            return { ...state, pass_strength: state.pass && state.valid_pass ? calc_pass_strength(state.pass) : 0 };
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
    useTitle("Register");

    let dispatch = useDispatch<Dispatch>();
    let [state, form_dispatch] = useReducer(register_state_reducer, DEFAULT_REGISTER_STATE);
    let [errorMsg, setErrorMsg] = useState<string | null>(null);
    let is_light_theme = useSelector(selectPrefsFlag(UserPreferenceFlags.LightMode));

    useEffect(() => {
        if(!SETUP_THEN && typeof zxcvbn == 'function') {
            zxcvbn().then(mod => {
                zxcvbn = { zxcvbn: mod.default };
                form_dispatch({ type: RegisterActionType.UpdatePassStrength, value: "" });
            });
            SETUP_THEN = true;
        }
    }, []);

    let passwordClass = useMemo(() => {
        let passwordClass: string = 'ln-password-';
        switch(state.pass_strength) {
            case 1: { passwordClass += 'weak'; break; }
            case 2: { passwordClass += 'mid'; break; }
            case 3: { passwordClass += 'strong'; break; }
            case 4: { passwordClass += 'vstrong'; break; }
            default: passwordClass += 'none';
        }
        return passwordClass;
    }, [state.pass_strength]);

    let hcaptcha = useRef<HCaptcha>(null);

    let on_submit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if(state.is_registering || !hcaptcha.current) return;

        form_dispatch({ type: RegisterActionType.Register, value: '' });

        let on_error = (err: string) => {
            setErrorMsg(err);
            form_dispatch({ type: RegisterActionType.NoRegister, value: '' });
        };

        let res;
        try {
            res = await hcaptcha.current.execute({ async: true });
        } catch(e) {
            on_error(HCAPTCHA_ERRORS[e] || "Unknown Error");
            return;
        }

        try {
            let req = await fetch({
                url: "/api/v1/user",
                method: XHRMethod.POST,
                json: {
                    email: state.email,
                    username: state.user,
                    password: state.pass,
                    year: state.dob.y,
                    month: state.dob.m,
                    day: state.dob.d,
                    token: res.response,
                },
            });

            if(req.status == 201 && req.response.auth != null) {
                dispatch(setSession(req.response))
            } else {
                on_error("Unknown Error: " + req.status);

                if(__DEV__) {
                    console.error("Missing auth field in response: ", req);
                }
            }
        } catch(req) {
            try {
                let response = req.response;
                if(typeof response === 'string') {
                    response = JSON.parse(response);
                }
                on_error(response.message);
            } catch(e) {
                on_error("Unknown error: " + req.status);

                if(__DEV__) {
                    console.error("Missing JSON in error response?", e, req);
                }
            }
        }
    };

    let on_email_change = useCallback(e => form_dispatch({ type: RegisterActionType.UpdateEmail, value: e.currentTarget.value }), []),
        on_username_change = useCallback(e => form_dispatch({ type: RegisterActionType.UpdateUser, value: e.currentTarget.value }), []),
        on_password_change = useCallback(e => form_dispatch({ type: RegisterActionType.UpdatePass, value: e.currentTarget.value }), []),
        on_year_change = useCallback(e => form_dispatch({ type: RegisterActionType.UpdateYear, value: e.currentTarget.value }), []),
        on_month_change = useCallback(e => form_dispatch({ type: RegisterActionType.UpdateMonth, value: e.currentTarget.value }), []),
        on_day_change = useCallback(e => form_dispatch({ type: RegisterActionType.UpdateDay, value: e.currentTarget.value }), []);

    return (
        <form className="ln-form ln-login-form ln-register-form ui-text" onSubmit={on_submit}>
            <div id="title">
                <h2><I18N t={Translation.REGISTER} /></h2>
            </div>

            <FormGroup>
                <FormLabel htmlFor="email"><I18N t={Translation.EMAIL_ADDRESS} /></FormLabel>
                <FormInput value={state.email} type="email" name="email" placeholder="example@example.com" required isValid={state.valid_email}
                    onChange={on_email_change} />
            </FormGroup>

            <FormGroup>
                <FormLabel htmlFor="username"><I18N t={Translation.USERNAME} /></FormLabel>
                <FormInput value={state.user} type="text" name="username" placeholder="username" required isValid={state.valid_user}
                    onChange={on_username_change} />
            </FormGroup>

            <FormGroup>
                <FormLabel htmlFor="password">
                    <I18N t={Translation.PASSWORD} />
                    <span className="ln-tooltip" style={{ marginLeft: '0.2em' }}>
                        <VectorIcon src={CircleEmptyInfoIcon} />
                        <Tooltip x={1} y={0}>
                            <div style={{ width: 'min(100vw, 20em)', fontSize: '0.7em' }}>
                                <p>Password strength is judged by length, complexity and resemblance to common English words.</p>
                            </div>
                        </Tooltip>
                    </span>
                </FormLabel>
                <FormInput type="password" name="password" placeholder="password" required isValid={state.valid_pass}
                    className={passwordClass} onChange={on_password_change} />
                <FormText>
                    Password must be at least 8 characters long and contain at least one number or one special character.
                </FormText>
            </FormGroup>

            <FormGroup>
                <FormLabel><I18N t={Translation.DATE_OF_BIRTH} /></FormLabel>
                <FormSelectGroup>
                    <FormSelect name="year" required value={state.dob.y || ""} onChange={on_year_change}>
                        <I18N t={Translation.YEAR} render={(value: string) => <option disabled hidden value="">{value}</option>} />
                        {useMemo(() => YEARS.map((year, i) => <option value={year} key={i}>{year}</option>), [])}
                    </FormSelect>

                    <FormSelect name="month" required value={state.dob.m != null ? state.dob.m : ""} onChange={on_month_change}>
                        <I18N t={Translation.MONTH} render={(value: string) => <option disabled hidden value="">{value}</option>} />
                        {useMemo(() => dayjs.months().map((month: string, i: number) => <option value={i + 1} key={i}>{month}</option>), [dayjs.locale()])}
                    </FormSelect>

                    <FormSelect name="day" required onChange={on_day_change}
                        value={state.dob.d == null ? "" : state.dob.d}>
                        <I18N t={Translation.DAY} render={(value: string) => <option disabled hidden value="">{value}</option>} />
                        {useMemo(() => (new Array(state.days)).fill(undefined).map((_, i) => (
                            <option value={i + 1} key={i}>{(i + 1).toString()}</option>
                        )), [state.days])}
                    </FormSelect>
                </FormSelectGroup>
            </FormGroup>

            {errorMsg && (
                <FormGroup>
                    <div className="ln-login-error">
                        Registration Error: {errorMsg}!
                    </div>
                </FormGroup>
            )}

            <hr />

            <FormGroup>
                <div style={{ display: 'flex', padding: '0 1em' }}>
                    <button
                        className={classNames('ln-btn ui-text', { 'ln-btn--loading-icon': state.is_registering })}
                        style={{ marginRight: 'auto' }}
                        onClick={() => setErrorMsg(null)}
                    >
                        {state.is_registering ? <Spinner size="2em" /> : "Register"}

                        <HCaptcha
                            ref={hcaptcha}
                            size="invisible"
                            theme={is_light_theme ? "light" : "dark"}
                            sitekey="7a2a9dd4-1fa3-44cf-aa98-147052e8ea25"
                            reCaptchaCompat={false}
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