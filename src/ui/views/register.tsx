import React from "react";

import { Link } from "react-router-dom";

import { Fireflies } from "../components/login/fireflies";

import "./register.scss";

import lantern from "../assets/lantern.svg";

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
                            <div className="ln-form-group">
                                <label className="ln-form-label" htmlFor="email">Email Address</label>
                                <span className="ln-form-control-wrapper">
                                    <input className="ln-form-control ln-tertiary-surface-background ln-secondary-surface-border ln-primary-text-color"
                                        type="email" name="email" placeholder="example@example.com" required />
                                </span>
                            </div>
                            <div className="ln-form-group">
                                <label className="ln-form-label" htmlFor="email">Username</label>
                                <span className="ln-form-control-wrapper">
                                    <input className="ln-form-control ln-tertiary-surface-background ln-secondary-surface-border ln-primary-text-color"
                                        type="text" name="username" placeholder="username" required />
                                </span>
                            </div>
                            <div className="ln-form-group">
                                <label className="ln-form-label" htmlFor="email">Nickname</label>
                                <span className="ln-form-control-wrapper">
                                    <input className="ln-form-control ln-tertiary-surface-background ln-secondary-surface-border ln-primary-text-color"
                                        type="text" name="nickname" placeholder="nickname" />
                                </span>
                            </div>
                            <div className="ln-form-group">
                                <label className="ln-form-label" htmlFor="email">Password</label>
                                <span className="ln-form-control-wrapper">
                                    <input className="ln-form-control ln-tertiary-surface-background ln-secondary-surface-border ln-primary-text-color"
                                        type="password" name="password" placeholder="password" required />
                                </span>
                            </div>
                            <div className="ln-form-group" style={{ display: 'flex', padding: '0 1em' }}>
                                <button className="ln-btn ln-primary-text-color" style={{ marginRight: 'auto' }}>Submit</button>
                                <Link to={"/login"} className="ln-btn ln-primary-text-color" >Go to Login</Link>
                            </div>
                            <div className="ln-form-group">
                                <p className="ln-form-text">
                                    By registering, you agree to our
                                </p>
                            </div>
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