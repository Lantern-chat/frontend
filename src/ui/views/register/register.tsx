import React from "react";
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

// TODO: Abstract form groups and inputs into components
export const RegisterView = () => {
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
                                <FormSelect required>
                                    <FormSelectOption disabled hidden selected>Year</FormSelectOption>

                                    {YEARS.map((year, i) => (
                                        <FormSelectOption value={year} key={i}>{year}</FormSelectOption>
                                    ))}
                                </FormSelect>
                                <FormSelect required>
                                    <FormSelectOption disabled hidden selected>Month</FormSelectOption>
                                    <FormSelectOption value="test">Test</FormSelectOption>
                                </FormSelect>
                                <FormSelect required>
                                    <FormSelectOption disabled hidden selected>Day</FormSelectOption>
                                    <FormSelectOption value="test">Test</FormSelectOption>
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