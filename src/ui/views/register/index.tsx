import React, { useState, useMemo, useReducer } from "react";
import * as dayjs from "dayjs";

import * as i18n from "ui/i18n";
import { I18N, Translation } from "ui/i18n";


import { Link } from "react-router-dom";

import { Fireflies } from "ui/components/login/fireflies";
import { Logo } from "ui/components/common/logo";
import { Glyphicon } from "ui/components/common/glyphicon/";

import { FormGroup, FormLabel, FormInput, FormText, FormSelect, FormSelectOption } from "ui/components/form";

//import { calcPasswordStrength } from "./password";

import zxcvbn from 'zxcvbn';

import "./register.scss";

function validateEmail(value: string): boolean {
    return /^[^@\s]+@[^@\s]+\.[^.@\s]+$/.test(value);
}

function validatePass(value: string): boolean {
    // TODO: Set this with server-side options
    return value.length >= 8 && /[^\w]|\d/.test(value);
}

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
const MONTHS: string = "January,February,March,April,May,June,July,August,September,October,November,December";

interface IDob {
    y?: number,
    m?: number,
    d?: number | null,
}

interface RegisterState {
    dob: IDob,
    days: number,
    email?: string,
    user?: string,
    pass?: string,
    pass_strength: number,
    valid_email: boolean | null,
    valid_user: boolean | null,
    valid_pass: boolean | null,
}

const DEFAULT_REGISTER_STATE: RegisterState = {
    dob: {},
    days: 31,
    pass_strength: 0,
    valid_email: null,
    valid_user: null,
    valid_pass: null,
}

enum RegisterActionType {
    UpdateEmail,
    UpdateUser,
    UpdatePass,
    UpdateYear,
    UpdateMonth,
    UpdateDay,
}

interface RegisterAction {
    value: string,
    type: RegisterActionType,
}

function calculateDays(dob: IDob): number {
    let num_days = dayjs(0).year(dob.y || 1970).month(dob.m || 11).daysInMonth();
    dob.d = (dob.d == null || num_days <= dob.d) ? null : dob.d;
    return num_days;
}

function register_state_reducer(state: RegisterState, { value, type }: RegisterAction): RegisterState {
    switch(type) {
        case RegisterActionType.UpdateEmail: {
            return { ...state, email: value, valid_email: validateEmail(value) };
        }
        case RegisterActionType.UpdateUser: {
            return { ...state, user: value, valid_user: value.length >= 3 };
        }
        case RegisterActionType.UpdatePass: {
            let valid_pass = validatePass(value);
            return {
                ...state,
                pass: value,
                valid_pass,
                pass_strength: valid_pass ? Math.max(zxcvbn(value).score, 1) : 0,
            };
        }
        case RegisterActionType.UpdateYear: {
            let dob = { ...state.dob, y: parseInt(value) };
            return { ...state, dob, days: calculateDays(dob) };
        }
        case RegisterActionType.UpdateMonth: {
            let dob = { ...state.dob, m: parseInt(value) };
            return { ...state, dob, days: calculateDays(dob) };
        }
        case RegisterActionType.UpdateDay: {
            let dob = { ...state.dob, d: parseInt(value) };
            return { ...state, dob };
        }
        default: return state;
    }
}

export function RegisterView() {
    let [state, dispatch] = useReducer(register_state_reducer, DEFAULT_REGISTER_STATE);

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

    return (
        <form className="ln-form ln-login-form ln-register-form">
            <div id="title">
                <h2><I18N t={Translation.REGISTER} /></h2>
            </div>

            <FormGroup>
                <FormLabel htmlFor="email"><I18N t={Translation.EMAIL_ADDRESS} /></FormLabel>
                <FormInput type="email" name="email" placeholder="example@example.com" required isValid={state.valid_email}
                    onChange={e => dispatch({ type: RegisterActionType.UpdateEmail, value: e.target.value })} />
            </FormGroup>

            <FormGroup>
                <FormLabel htmlFor="username"><I18N t={Translation.USERNAME} /></FormLabel>
                <FormInput type="text" name="username" placeholder="username" required isValid={state.valid_user}
                    onChange={e => dispatch({ type: RegisterActionType.UpdateUser, value: e.target.value })} />
            </FormGroup>

            <FormGroup>
                <FormLabel htmlFor="password">
                    <I18N t={Translation.PASSWORD} />
                    <span style={{ paddingLeft: '0.2em' }}>
                        <Glyphicon import={() => import(/* webpackPreload: true */ "icons/glyphicons-pro/glyphicons-basic-2-3/svg/individual-svg/glyphicons-basic-196-circle-empty-info.svg")} />
                    </span>
                </FormLabel>
                <FormInput type="password" name="password" placeholder="password" required isValid={state.valid_pass}
                    classNames={passwordClass} onChange={e => dispatch({ type: RegisterActionType.UpdatePass, value: e.target.value })} />
                <FormText>
                    Password must be at least 8 characters long and contain at least one number or one special character.
                    </FormText>
            </FormGroup>

            <FormGroup>
                <FormLabel><I18N t={Translation.DATE_OF_BIRTH} /></FormLabel>
                <div className="ln-select-group">
                    <FormSelect required defaultValue="" onChange={e => dispatch({ type: RegisterActionType.UpdateYear, value: e.target.value })}>
                        <I18N t={Translation.YEAR} render={value => <option disabled hidden value="">{value}</option>} />
                        {useMemo(() => YEARS.map((year, i) => <option value={year} key={i}>{year}</option>), [])}
                    </FormSelect>

                    <FormSelect required defaultValue="" onChange={e => dispatch({ type: RegisterActionType.UpdateMonth, value: e.target.value })}>
                        <I18N t={Translation.MONTH} render={value => <option disabled hidden value="">{value}</option>} />
                        <I18N t={Translation.MONTHS} render={(months: string) => (
                            months.split(',').map((month, i) => <option value={i} key={i}>{month}</option>)
                        )} />
                    </FormSelect>

                    <FormSelect required onChange={e => dispatch({ type: RegisterActionType.UpdateDay, value: e.target.value })}
                        value={state.dob.d == null ? "" : state.dob.d}>
                        <I18N t={Translation.DAY} render={value => <option disabled hidden value="">{value}</option>} />
                        {useMemo(() => (new Array(state.days)).fill(undefined).map((_, i) => (
                            <option value={i} key={i}>{(i + 1).toString()}</option>
                        )), [state.days])}
                    </FormSelect>
                </div>
            </FormGroup>

            <hr />

            <FormGroup>
                <div style={{ display: 'flex', padding: '0 1em' }}>
                    <button className="ln-btn" style={{ marginRight: 'auto' }}>Submit</button>
                    <Link to={"/login"} className="ln-btn" >Go to Login</Link>
                </div>
            </FormGroup>

            <FormGroup>
                <FormText>
                    By registering, you agree to our
                            </FormText>
            </FormGroup>
        </form>
    );
}
export default RegisterView;
if(process.env.NODE_ENV !== 'production') {
    RegisterView.displayName = "RegisterView";
}