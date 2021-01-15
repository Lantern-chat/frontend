import React from "react";

import { Link } from "react-router-dom";

import { Fireflies } from "../components/login/fireflies";

import "./register.scss";

import lantern from "../assets/lantern.svg";

// TODO: Abstract form groups and inputs into components
export const RegisterView = () => {
    let [offset, setOffset] = React.useState({ x: 0, y: 0 });

    React.useEffect(() => {
        let listener = (ev: MouseEvent) => {
            setOffset({ x: ev.clientX, y: ev.clientY });
        };
        window.addEventListener('mousemove', listener);

        return () => window.removeEventListener('mousemove', listener);
    }, []);

    return (
        <>
            <div className="ln-center ln-register">
                <Fireflies count={80} />
                <div className="ln-secondary-surface-background ln-register-container" style={{ zIndex: 1 }}>
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
                    <div className="ln-logo" >
                        <img src={lantern}></img>
                    </div>
                </div>
            </div>
        </>
    );
}
export default RegisterView;