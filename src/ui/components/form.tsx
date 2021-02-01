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
    children: React.ReactNode
}

export const FormGroup: React.FunctionComponent<IFormGroupProps> = React.memo((props: IFormGroupProps) => {
    return <div className="ln-form-group" {...props} />
});

export const FormLabel: React.FunctionComponent<IFormLabelProps> = React.memo((props: IFormLabelProps) => {
    return <label className="ln-form-label" {...props} />;
});

export const FormText: React.FunctionComponent<IFormTextProps> = React.memo((props: IFormTextProps) => {
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
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void,
}

export const FormInput: React.FunctionComponent<IFormInputProps> = React.memo((props: IFormInputProps) => {
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
    children: React.ReactNode,
    value?: string | number,
    disabled?: boolean,
    selected?: boolean,
    hidden?: boolean,
}

export const FormSelectOption: React.FunctionComponent<IFormSelectOptionProps> = React.memo((props: IFormSelectOptionProps) => {
    return (
        <option {...props} />
    );
});

interface IFormSelectProps {
    children: React.ReactNode,
    value?: string | number,
    name?: string,
    defaultValue?: string | number,
    required?: boolean,
    onChange?: (opt: React.ChangeEvent<HTMLSelectElement>) => void,
}

export const FormSelect: React.FunctionComponent<IFormSelectProps> = React.memo((props: IFormSelectProps) => {
    return (
        <div className="ln-form-select-wrapper">
            <select className="ln-form-select" {...props} />
            <span className="ln-form-select-arrow" />
        </div>
    );
});

export const FormSelectGroup: React.FunctionComponent = React.memo(({ children }: { children: React.ReactNode }) => (
    <div className="ln-select-group">{children}</div>
));

if(process.env.NODE_ENV !== 'production') {
    FormGroup.displayName = "FormGroup";
    FormLabel.displayName = "FormLabel";
    FormText.displayName = "FormText";
    FormSelect.displayName = "FormSelect";
    FormSelectOption.displayName = "FormSelectOption";
    FormInput.displayName = "FormInput";
    FormSelectGroup.displayName = "FormSelectGroup";
}