import React from "react";

import { Link } from "react-router-dom";

import { Fireflies } from "ui/components/login/fireflies";
import { FormGroup, FormLabel, FormInput } from "ui/components/form";

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

// TODO: Abstract form groups and inputs into components
export const RegisterView = () => {
    return (
        <>
            <Fireflies count={80} />
            <div className="ln-center ln-register">
                <div className="ln-register-container" style={{ zIndex: 1 }}>
                    <form className="ln-form">
                        <div id="title">
                            <h2>Register</h2>
                        </div>
                        <FormGroup>
                            <FormLabel htmlFor="email">Email Address</FormLabel>
                            <FormInput type="email" name="email" placeholder="example@example.com" required validator={validateEmail} />
                        </FormGroup>
                        <FormGroup>
                            <FormLabel htmlFor="email">Username</FormLabel>
                            <FormInput type="text" name="username" placeholder="username" required validator={hasLength(6)} />
                        </FormGroup>
                        <FormGroup>
                            <FormLabel htmlFor="email">Nickname</FormLabel>
                            <FormInput type="text" name="nickname" placeholder="nickname" />
                        </FormGroup>
                        <FormGroup>
                            <FormLabel htmlFor="email">Password</FormLabel>
                            <FormInput type="password" name="password" placeholder="password" required validator={validatePass} />
                            <p className="ln-form-text">
                                Password must be at least 8 characters long and containing at least one number or special character.
                                </p>
                        </FormGroup>
                        <hr />
                        <FormGroup>
                            <div style={{ display: 'flex', padding: '0 1em' }}>
                                <button className="ln-btn" style={{ marginRight: 'auto' }}>Submit</button>
                                <Link to={"/login"} className="ln-btn" >Go to Login</Link>
                            </div>
                        </FormGroup>
                        <FormGroup>
                            <p className="ln-form-text">
                                By registering, you agree to our
                            </p>
                        </FormGroup>
                    </form>
                    <div className="ln-logo" >
                        <img src={lantern}></img>
                    </div>
                </div>
            </div>
        </>
    );
}
export default RegisterView;