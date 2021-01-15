import React from "react";

import { Link } from "react-router-dom";

import { Fireflies } from "../components/login/fireflies";
import { FormGroup, FormLabel, FormInput } from "../components/form";

import "./register.scss";

import lantern from "../assets/lantern.svg";

function hasLength(length: number): (value: string) => boolean {
    return (value: string) => value.length > length;
}

function validateEmail(value: string): boolean {
    return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value);
}

// TODO: Abstract form groups and inputs into components
export const RegisterView = () => {
    return (
        <>
            <Fireflies count={80} />
            <div className="ln-center ln-register">
                <div className="ln-secondary-surface-background ln-register-container" style={{ zIndex: 1 }}>
                    <form className="ln-primary-text-color ln-form">
                        <div className="ln-form-inner">
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
                                <FormInput type="password" name="password" placeholder="password" required validator={hasLength(8)} />
                            </FormGroup>
                            <FormGroup>
                                <div style={{ display: 'flex', padding: '0 1em' }}>
                                    <button className="ln-btn ln-primary-text-color" style={{ marginRight: 'auto' }}>Submit</button>
                                    <Link to={"/login"} className="ln-btn ln-primary-text-color" >Go to Login</Link>
                                </div>
                            </FormGroup>
                            <FormGroup>
                                <p className="ln-form-text">
                                    By registering, you agree to our
                                </p>
                            </FormGroup>
                        </div>
                        <div className="ln-logo" >
                            <img src={lantern}></img>
                        </div>
                    </form>

                </div>
            </div>
        </>
    );
}
export default RegisterView;