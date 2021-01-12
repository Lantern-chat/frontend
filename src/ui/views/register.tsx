import React from "react";

import { Link } from "react-router-dom";

import "./register.scss";

import lantern from "../assets/lantern_wax.svg";

// TODO: Abstract form groups and inputs into components
export default class RegisterView extends React.Component {
    render() {
        return (
            <>
                <div className="ln-center ln-register">
                    <div className="ln-secondary-surface-background ln-register-container">
                        <form className="ln-primary-text-color">
                            <div className="ln-center">
                                <h2>Register</h2>
                            </div>
                            <div className="ln-form-group">
                                <label className="form-label" htmlFor="email">Email Address</label>
                                <span className="ln-form-control-wrapper">
                                    <input className="ln-form-control ln-tertiary-surface-background ln-secondary-surface-border ln-primary-text-color"
                                        type="email" name="email" placeholder="example@example.com" required />
                                </span>
                            </div>
                            <div className="ln-form-group">
                                <label className="form-label" htmlFor="email">Username</label>
                                <span className="ln-form-control-wrapper">
                                    <input className="ln-form-control ln-tertiary-surface-background ln-secondary-surface-border ln-primary-text-color"
                                        type="text" name="username" placeholder="username" required />
                                </span>
                            </div>
                            <div className="ln-form-group">
                                <label className="form-label" htmlFor="email">Nickname</label>
                                <span className="ln-form-control-wrapper">
                                    <input className="ln-form-control ln-tertiary-surface-background ln-secondary-surface-border ln-primary-text-color"
                                        type="text" name="nickname" placeholder="nickname" />
                                </span>
                            </div>
                            <div className="ln-form-group">
                                <label className="form-label" htmlFor="email">Password</label>
                                <span className="ln-form-control-wrapper">
                                    <input className="ln-form-control ln-tertiary-surface-background ln-secondary-surface-border ln-primary-text-color"
                                        type="password" name="password" placeholder="password" required />
                                </span>
                            </div>
                            <div>
                                <Link to={"/login"}>Go to Login</Link>
                            </div>
                        </form>
                        <div className="ln-logo">
                            <img src={lantern}></img>
                        </div>
                    </div>
                </div>
                <div className="ln-fireflies-1"></div>
            </>
        );
    }
}