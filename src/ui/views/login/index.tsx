import React, { useState, useMemo, useReducer } from "react";

import * as i18n from "ui/i18n";
import { I18N, Translation } from "ui/i18n";


import { Link } from "react-router-dom";

import { Logo } from "ui/components/common/logo";
import { Glyphicon } from "ui/components/common/glyphicon/";
import { FormGroup, FormLabel, FormInput, FormText, FormSelect, FormSelectOption } from "ui/components/form";

import "./login.scss";

function validateEmail(value: string): boolean {
    return /^[^@\s]+@[^@\s]+\.[^.@\s]+$/.test(value);
}

var PRELOADED: boolean = false;
function preloadRegister() {
    if(!PRELOADED) {
        import(/* webpackChunkName: 'RegisterView' */ "../register");
        PRELOADED = true;
    }
}

export default class LoginView extends React.Component {
    render() {
        return (
            <form className="ln-form ln-login-form">
                <div id="title">
                    <h2><I18N t={Translation.LOGIN} /></h2>
                </div>

                <FormGroup>
                    <FormLabel htmlFor="username"><I18N t={Translation.USERNAME} /></FormLabel>
                    <FormInput type="text" name="username" placeholder="username" required />
                </FormGroup>

                <FormGroup>
                    <FormLabel htmlFor="password">
                        <I18N t={Translation.PASSWORD} />
                    </FormLabel>
                    <FormInput type="password" name="password" placeholder="password" />
                </FormGroup>
                <hr />
                <FormGroup>
                    <div style={{ display: 'flex', padding: '0 1em' }}>
                        <button className="ln-btn" style={{ marginRight: 'auto' }}>Login</button>
                        <Link className="ln-btn" to={"/register"} onMouseOver={() => preloadRegister()}>Register</Link>
                    </div>
                </FormGroup>
            </form>
        );
    }
}