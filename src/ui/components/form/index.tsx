import { JSXInternal } from "preact/src/jsx";
import Preact, { useMemo, useRef, useState } from "preact/compat";

import "./form.scss";

interface IFormGroupProps {
    children: preact.ComponentChildren
}

interface IFormLabelProps {
    children: preact.ComponentChildren,
    htmlFor?: string,
}

interface IFormTextProps {
    children: preact.ComponentChildren
}

export const FormGroup: Preact.FunctionComponent<IFormGroupProps> = Preact.memo((props: IFormGroupProps) => {
    return <div className="ln-form-group" {...props} />
});

export const FormLabel: Preact.FunctionComponent<IFormLabelProps> = Preact.memo((props: IFormLabelProps) => {
    return <label className="ln-form-label" {...props} />;
});

export const FormText: Preact.FunctionComponent<IFormTextProps> = Preact.memo((props: IFormTextProps) => {
    return <p className="ln-form-text" {...props} />;
});

interface IFormInputProps {
    type: string,
    name: string,
    value?: string,
    placeholder?: string,
    required?: boolean,
    classNames?: string,
    isValid?: boolean | null,
    onChange?: (e: JSXInternal.TargetedEvent<HTMLInputElement>) => void,
}

export const FormInput: Preact.FunctionComponent<IFormInputProps> = Preact.memo((props: IFormInputProps) => {
    let classNames = "ln-form-control-wrapper ";

    if(props.classNames) {
        classNames += props.classNames;
    }

    if(props.isValid != null) {
        classNames += props.isValid ? ' ln-success' : ' ln-error';
    }

    return (
        <span className={classNames}>
            <input className="ln-form-control"
                type={props.type}
                name={props.name}
                placeholder={props.placeholder}
                required={props.required}
                value={props.value}
                onChange={props.onChange} />
        </span>
    );
});


interface IFormSelectOptionProps {
    children: preact.ComponentChildren,
    value?: string | number,
    disabled?: boolean,
    selected?: boolean,
    hidden?: boolean,
}

export const FormSelectOption: Preact.FunctionComponent<IFormSelectOptionProps> = Preact.memo((props: IFormSelectOptionProps) => {
    return (
        <option {...props} />
    );
});

interface IFormSelectProps {
    children: preact.ComponentChildren,
    value?: string | number,
    name?: string,
    defaultValue?: string | number,
    required?: boolean,
    onChange?: (opt: JSXInternal.TargetedEvent<HTMLSelectElement>) => void,
}

export const FormSelect: Preact.FunctionComponent<IFormSelectProps> = Preact.memo((props: IFormSelectProps) => {
    return (
        <div className="ln-form-select-wrapper">
            <select className="ln-form-select" {...props} />
            <span className="ln-form-select-arrow" />
        </div>
    );
});

if(process.env.NODE_ENV !== 'production') {
    FormGroup.displayName = "FormGroup";
    FormLabel.displayName = "FormLabel";
    FormText.displayName = "FormText";
    FormSelect.displayName = "FormSelect";
    FormSelectOption.displayName = "FormSelectOption";
    FormInput.displayName = "FormInput";
}