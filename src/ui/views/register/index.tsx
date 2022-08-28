import { createMemo, createSignal, For, Index, JSX, onMount, Show } from "solid-js";

import { createController } from "ui/hooks/createController";

import { setSession } from "state/commands";
import { usePrefs } from "state/contexts/prefs";

import dayjs from "lib/time";

import { useRootDispatch } from "state/root";
import { CLIENT } from "state/global";

import { createReducer } from "ui/hooks/createReducer";
import { setTitle } from "ui/hooks/setTitle";

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

import type { ZxcvbnResult } from "@zxcvbn-ts/core";

type zxcvbn_fn = (input: string) => ZxcvbnResult;

var zxcvbn: { zxcvbn: zxcvbn_fn } | (() => Promise<{ default: zxcvbn_fn }>) = () => import('lib/password');

// var PRELOADED: boolean = false;
// function preloadLogin() {
//     if(!PRELOADED) {
//         import(/* webpackChunkName: 'LoginView' */ "../login");
//         PRELOADED = true;
//     }
// }

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

// TODO: i18n these
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

import { useI18nContext } from 'ui/i18n/i18n-solid';

import "../login/login.scss";
import "./register.scss";
export default function RegisterView() {
    const { LL, locale } = useI18nContext();

    setTitle(() => LL().REGISTER());

    let dispatch = useRootDispatch();

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
    let prefs = usePrefs();

    onMount(() => {
        if(!SETUP_THEN && typeof zxcvbn == 'function') {
            zxcvbn().then(mod => {
                zxcvbn = { zxcvbn: mod.default };
                form_dispatch({ type: RegisterActionType.UpdatePassStrength, value: "" });
            });
            SETUP_THEN = true;
        }
    });

    let valid_email = () => state.email ? validateEmail(state.email) : null;
    let valid_user = () => state.user ? validateUsername(state.user) : null;
    let valid_pass = createMemo(() => state.pass ? validatePass(state.pass) : null);

    let passwordClass = () => {
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
    };

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
            on_error(HCAPTCHA_ERRORS[e] || LL().UNKNOWN_ERROR());
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
                msg = LL().NETWORK_ERROR() + ': ' + e.msg();
            } else {
                msg = LL().UNKNOWN_ERROR();
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
        <form class="ln-form ln-login-form ln-register-form ui-text" onSubmit={on_submit}>
            <div id="title">
                <h2>{LL().REGISTER()}</h2>
            </div>

            <FormGroup>
                <FormLabel for="email">{LL().EMAIL_ADDRESS()}</FormLabel>
                <FormInput value={state.email} type="email" name="email" placeholder="example@example.com" required isValid={valid_email()}
                    onInput={on_email_change} />
            </FormGroup>

            <FormGroup>
                <FormLabel for="username">{LL().USERNAME()}</FormLabel>
                <FormInput value={state.user} type="text" name="username"
                    placeholder={LL().USERNAME().toLocaleLowerCase(locale())} required isValid={valid_user()}
                    onInput={on_username_change} />
            </FormGroup>

            <FormGroup>
                <FormLabel for="password">
                    {LL().PASSWORD()}
                    <span class="ln-tooltip" style={{ marginLeft: '0.2em' }}>
                        <VectorIcon src={CircleEmptyInfoIcon} />
                    </span>
                </FormLabel>
                <FormInput type="password" name="password" placeholder={LL().PASSWORD().toLocaleLowerCase(locale())} required isValid={valid_pass()}
                    class={passwordClass()} onInput={on_password_change} />
                <FormText>{LL().PASSWORD_REQS()}</FormText>
            </FormGroup>

            <FormGroup>
                <FormLabel>{LL().DATE_OF_BIRTH()}</FormLabel>
                <FormSelectGroup>
                    <FormSelect name="year" required value={state.dob.y || ""} onChange={on_year_change}>
                        <option disabled hidden value="">{LL().YEAR()}</option>

                        <For each={YEARS}>
                            {year => <option value={year}>{year}</option>}
                        </For>
                    </FormSelect>

                    <FormSelect name="month" required value={state.dob.m != null ? state.dob.m : ""} onChange={on_month_change}>
                        <option disabled hidden value="">{LL().MONTH()}</option>

                        {/*NOTE: Make each dependent on LL(), so the dayjs locale is updated as well*/}
                        <For each={(LL(), dayjs.months())}>
                            {(month, i) => <option value={i() + 1}>{month}</option>}
                        </For>
                    </FormSelect>

                    <FormSelect name="day" required onChange={on_day_change} value={state.dob.d == null ? "" : state.dob.d}>
                        <option disabled hidden value="">{LL().DAY()}</option>

                        <Index each={new Array(state.days)}>
                            {(_, i) => <option value={i + 1}>{(i + 1).toString()}</option>}
                        </Index>
                    </FormSelect>
                </FormSelectGroup>
            </FormGroup>

            <Show when={errorMsg()}>
                <FormGroup>
                    <div class="ln-login-error">
                        Registration Error: {errorMsg()}!
                    </div>
                </FormGroup>
            </Show>

            <hr />

            <FormGroup>
                <div style={{ display: 'flex', padding: '0 1em' }}>
                    <button
                        class="ln-btn ui-text"
                        classList={{ 'ln-btn--loading-icon': state.is_registering }}
                        style={{ "margin-inline-end": 'auto' }}
                        onClick={() => setErrorMsg(null)}
                    >
                        <Show when={state.is_registering} fallback={LL().REGISTER()}>
                            <Spinner size="2em" />
                        </Show>

                        <HCaptcha
                            setController={setHCaptchaController}
                            params={{
                                size: "invisible",
                                theme: prefs.LightMode() ? "light" : "dark",
                                sitekey: "7a2a9dd4-1fa3-44cf-aa98-147052e8ea25"
                            }}
                        />
                    </button>


                    <Link href="/login" class="ln-btn">{LL().GOTO_LOGIN()}</Link>
                </div>
            </FormGroup>

            <FormGroup>
                <FormText>{LL().REGISTER_AGREE()}</FormText>

                <FormText>
                    <HCaptchaTerms />
                </FormText>
            </FormGroup>
        </form>
    );
}

function HCaptchaTerms() {
    let { LL } = useI18nContext();

    return createMemo(() => {
        let t = LL().hCaptcha();
        let segments: Array<JSX.Element> = [];
        let re = /([^<]+)|<[@#](.+?)>/g, match;

        do {
            match = re.exec(t);
            if(match) {
                let [m, p1, p2] = match;

                if(p1) {
                    segments.push(p1);
                } else if(p2) {
                    let href = "https://hcaptcha.com/" + (m.startsWith('<@') ? "privacy" : "terms");

                    segments.push(<a target="_blank" href={href}>{p2}</a>);
                }
            }
        } while(match);

        return segments;
    });
}