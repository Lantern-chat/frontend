import React, { useMemo, useRef, useState } from "react";

import "./form.scss";

interface IFormGroupProps {
    children: React.ReactNode
}

interface IFormLabelProps {
    children: React.ReactNode,
    htmlFor?: string,
}

interface IFormTextProps {
    children: React.ReactNode,
}

interface IFormInputProps {
    type: string,
    name: string,
    placeholder?: string,
    required?: boolean,
    validator?: (value: string) => boolean,
    validateOnRender?: boolean,
}

export const FormGroup = React.memo((props: IFormGroupProps) => {
    return <div className="ln-form-group" {...props} />
});

export const FormLabel = React.memo((props: IFormLabelProps) => {
    return <label className="ln-form-label" {...props} />;
});

export const FormText = React.memo((props: IFormTextProps) => {
    return <p className="ln-form-text" {...props} />;
});

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

interface IFormSelectOptionProps {
    children: React.ReactNode,
    value?: string | number,
    disabled?: boolean,
    selected?: boolean,
    hidden?: boolean,
}

export const FormSelectOption = React.memo((props: IFormSelectOptionProps) => {
    return (
        <option {...props} />
    );
});

type FormSelectOptionChild = React.ReactElement<(typeof FormSelectOption)>;

interface IFormSelectProps {
    children: React.ReactNode,
    value?: string | number,
    defaultValue?: string | number,
    required?: boolean,
    onChange?: (opt: React.ChangeEvent<HTMLSelectElement>) => void,
}

export const FormSelect = React.memo((props: IFormSelectProps) => {
    return (
        <div className="ln-form-select-wrapper">
            <select className="ln-form-select" {...props} />
            <span className="ln-form-select-arrow" />
        </div>
    );
});