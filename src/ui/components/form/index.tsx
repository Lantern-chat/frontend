import React, { useMemo, useRef, useState } from "react";

import "./form.scss";

interface IFormGroupProps {
    children: React.ReactNode
}

interface IFormLabelProps {
    children: React.ReactNode,
    htmlFor: string,
}

interface IFormInputProps {
    type: string,
    name: string,
    placeholder?: string,
    required?: boolean,
    validator?: (value: string) => boolean,
    validateOnRender?: boolean,
}

export function FormGroup(props: IFormGroupProps) {
    return <div className="ln-form-group" {...props} />
};

export function FormLabel(props: IFormLabelProps) {
    return <label className="ln-form-label" {...props} />;
};

export function FormInput(props: IFormInputProps) {
    let input: React.RefObject<HTMLInputElement> = useRef(null);
    let [value, setValue] = useState<string | null>(null);

    let classNames = "ln-form-control-wrapper";

    let isValid = null;

    if(value != null) {
        if(props.validator) isValid = props.validator(value);
    }

    if(isValid != null || props.validateOnRender) {
        if(isValid) {
            classNames += ' ln-success';
        } else {
            classNames += ' ln-error';
        }
    }

    return (
        <span className={classNames}>
            <input className="ln-form-control"
                ref={input}
                type={props.type}
                name={props.name}
                placeholder={props.placeholder}
                required={props.required}
                onChange={(e) => setValue(e.target.value)} />
        </span>
    );
};

export interface IFormProps {
    children: React.ReactNode
}

export function Form(props: IFormProps) {

}