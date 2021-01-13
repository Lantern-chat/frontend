import React from "react";

import { Link } from "react-router-dom";

import "./register.scss";

import lantern from "../assets/lantern_wax.svg";

const Firefly = React.memo(() => {
    let offset_x = Math.random() * 100;
    let offset_y = Math.random() * 100;
    let offset_a = Math.random() * 360;

    let idx = Math.floor(Math.random() * 2);
    let className = "ln-random-walk-" + idx;

    let style = {
        position: "absolute" as any, // TypeScript is bugged
        left: offset_x + '%',
        top: offset_y + '%',
        animationDuration: (Math.random() + 1) + 's',
        transform: `rotate(${offset_a}deg)`,
        animationDelay: (Math.random() * 2) + 's',
    };

    return (<span className={"ln-firefly ln-blinking " + className} style={style} />)
});


// TODO: Abstract form groups and inputs into components
export default class RegisterView extends React.Component {
    render() {
        return (
            <>
                <div className="ln-center ln-register">
                    {(() => {
                        let children = [];
                        for(let i = 0; i < 20; i++) {
                            children.push(<Firefly key={i} />);
                        }
                        return children;
                    })()}
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
}