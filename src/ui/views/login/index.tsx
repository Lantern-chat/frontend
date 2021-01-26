import Preact, { useState, useMemo, useReducer, useEffect } from "preact/compat";

import * as i18n from "ui/i18n";
import { I18N, Translation } from "ui/i18n";

import { Link } from "wouter-preact";

import { Logo } from "ui/components/common/logo";
import { Glyphicon } from "ui/components/common/glyphicon/";
import { FormGroup, FormLabel, FormInput, FormText, FormSelect, FormSelectOption } from "ui/components/form";
import { Modal } from "ui/components/modal";
import { useTitle } from "ui/hooks/useTitle";

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

import "./login.scss";
export default function LoginView() {
    useTitle("Login");

    let [showModal, setShowModal] = useState(false);

    let toggleModal = (e: any) => {
        e.preventDefault();
        setShowModal(!showModal);
    };

    let modal = !showModal ? null : (
        <Modal>
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, zIndex: 'inherit', backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>
                <div className="ln-center-standalone" style={{ color: 'white' }}>
                    Hello, World!
                    <button onClick={toggleModal}>Close</button>
                </div>
            </div>
        </Modal>
    );

    return (
        <>
            {modal}
            <form className="ln-form ln-login-form">
                <div id="title">
                    <h2><I18N t={Translation.LOGIN} /></h2>
                </div>

                <FormGroup>
                    <FormLabel htmlFor="email"><I18N t={Translation.EMAIL_ADDRESS} /></FormLabel>
                    <FormInput type="text" name="email" placeholder="example@example.com" required />
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
                        <button className="ln-btn" style={{ marginRight: 'auto' }} onClick={toggleModal}>Login</button>
                        <Link className="ln-btn" to={"/register"} onMouseOver={() => preloadRegister()}>Register</Link>
                    </div>
                </FormGroup>
            </form>
        </>
    );
}