import React, { useState, useMemo } from "react";
import * as dayjs from "dayjs";

import { Link } from "react-router-dom";

import { Fireflies } from "ui/components/login/fireflies";
import { FormGroup, FormLabel, FormInput, FormText, FormSelect, FormSelectOption } from "ui/components/form";

import "./register.scss";

import lantern from "/ui/assets/lantern.svg";

function hasLength(length: number): (value: string) => boolean {
    return (value: string) => value.length > length;
}

function validateEmail(value: string): boolean {
    return /^[^@\s]+@[^@\s]+\.[^.@\s]+$/.test(value);
}

function validatePass(value: string): boolean {
    // TODO: Set this with server-side options
    return value.length > 8 && /[^\w]|\d/.test(value);
}

const YEARS: string[] = [];
const CURRENT_YEAR = dayjs().year();
for(let i = 0; i < 100; i++) {
    YEARS.push((CURRENT_YEAR - 13 - i).toString());
}
const MONTHS: string[] = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
];

interface IDob {
    y?: number,
    m?: number,
    d?: number,
}

function calculateDays(dob: IDob): number {
    return dayjs(0).year(dob.y || 1970).month(dob.m || 11).daysInMonth();
}

export const RegisterView = () => {
    let [dob, setDob] = useState<IDob>({});
    let num_days = useMemo(() => calculateDays(dob), [dob.y, dob.m]);

    return (
        <>
            <Fireflies count={80} />
            <div className="ln-box ln-register">
                <div className="ln-register-container ln-centered" style={{ zIndex: 1 }}>
                    <form className="ln-form">
                        <div id="title">
                            <h2>Register</h2>
                        </div>
                        <FormGroup>
                            <FormLabel htmlFor="email">Email Address</FormLabel>
                            <FormInput type="email" name="email" placeholder="example@example.com" required validator={validateEmail} />
                        </FormGroup>
                        <FormGroup>
                            <FormLabel htmlFor="username">Username</FormLabel>
                            <FormInput type="text" name="username" placeholder="username" required validator={hasLength(3)} />
                        </FormGroup>
                        <FormGroup>
                            <FormLabel htmlFor="password">Password</FormLabel>
                            <FormInput type="password" name="password" placeholder="password" required validator={validatePass} />
                            <FormText>
                                Password must be at least 8 characters long and contain at least one number or one special character.
                            </FormText>
                        </FormGroup>
                        <FormGroup>
                            <FormLabel>Date of Birth</FormLabel>
                            <div className="ln-box">
                                <FormSelect required defaultValue="" onChange={e => setDob({ ...dob, y: parseInt(e.target.value) })}>
                                    <FormSelectOption disabled hidden value="">Year</FormSelectOption>
                                    {YEARS.map((year, i) => <FormSelectOption value={year} key={i}>{year}</FormSelectOption>)}
                                </FormSelect>
                                <FormSelect required defaultValue="" onChange={e => setDob({ ...dob, m: parseInt(e.target.value) })}>
                                    <FormSelectOption disabled hidden value="">Month</FormSelectOption>
                                    {MONTHS.map((month, i) => <FormSelectOption value={i} key={i}>{month}</FormSelectOption>)}
                                </FormSelect>
                                <FormSelect required onChange={e => setDob({ ...dob, d: parseInt(e.target.value) })}
                                    value={(dob.d == null || num_days <= dob.d) ? "" : dob.d}>
                                    <FormSelectOption disabled hidden value="">Day</FormSelectOption>
                                    {(new Array(num_days)).fill(undefined).map((_, i) => (
                                        <FormSelectOption value={i} key={i}>{(i + 1).toString()}</FormSelectOption>
                                    ))}
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
                    <div className="ln-logo" >
                        <img src={lantern}></img>
                    </div>
                </div>
            </div >
        </>
    );
}
export default RegisterView;