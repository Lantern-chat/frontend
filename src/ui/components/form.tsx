import { JSX } from "solid-js";

import "./form.scss";

interface IFormGroupProps {
    children: JSX.Element,
    id?: string,
}

interface IFormLabelProps {
    children: JSX.Element,
    htmlFor?: string,
}

interface IFormTextProps {
    children: JSX.Element,
}

export function FormGroup(props: IFormGroupProps) {
    return <div className="ln-form-group" {...props} />
}

export function FormLabel(props: IFormLabelProps) {
    return <label className="ln-form-label" {...props} />;
}

export function FormText(props: IFormTextProps) {
    return <p className="ln-form-text" {...props} />;
}

interface IFormInputProps extends JSX.InputHTMLAttributes<HTMLInputElement> {
    isValid?: boolean | null,
    onChange?: (e: Event) => void,
    onInput?: (e: InputEvent) => void,
}

export function FormInput(props: IFormInputProps) {
    return (
        <span className="ln-form-control-wrapper" classList={{
            [props.className || '']: true,
            'ln-success': props.isValid === true,
            'ln-error': props.isValid === false,
        }}>
            <input {...props} className="ln-form-control ui-text" />
        </span>
    );
}


interface IFormSelectOptionProps {
    children: JSX.Element,
    value?: string | number,
    disabled?: boolean,
    selected?: boolean,
    hidden?: boolean,
}

export function FormSelectOption(props: IFormSelectOptionProps) {
    return (
        <option {...props} />
    );
}

interface IFormSelectProps {
    children: JSX.Element,
    value?: string | number,
    name?: string,
    defaultValue?: string | number,
    required?: boolean,
    onChange?: (opt: Event) => void,
}

export function FormSelect(props: IFormSelectProps) {
    return (
        <div className="ln-form-select-wrapper">
            <select className="ln-form-select" {...props} />
            <span className="ln-form-select-arrow" />
        </div>
    );
}

export function FormSelectGroup(props: { children: JSX.Element }) {
    return <div className="ln-select-group">{props.children}</div>
}