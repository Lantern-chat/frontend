import { JSX } from "solid-js";

import "./form.scss";

interface IFormGroupProps {
    children: JSX.Element,
    id?: string,
}

interface IFormLabelProps {
    children: JSX.Element,
    for?: string,
}

interface IFormTextProps {
    children: JSX.Element,
}

export function FormGroup(props: IFormGroupProps) {
    return <div class="ln-form-group" {...props} />
}

export function FormLabel(props: IFormLabelProps) {
    return <label class="ln-form-label" {...props} />;
}

export function FormText(props: IFormTextProps) {
    return <p class="ln-form-text" {...props} />;
}

interface IFormInputProps extends JSX.InputHTMLAttributes<HTMLInputElement> {
    isValid?: boolean | null,
    onChange?: (e: Event) => void,
    onInput?: (e: InputEvent) => void,
}

export function FormInput(props: IFormInputProps) {
    return (
        <span class="ln-form-control-wrapper" classList={{
            [props.class || ""]: true,
            "ln-success": props.isValid === true,
            "ln-error": props.isValid === false,
        }}>
            <input {...props} class="ln-form-control ui-text" />
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
        <div class="ln-form-select-wrapper">
            <select class="ln-form-select" {...props} />
            <span class="ln-form-select-arrow" />
        </div>
    );
}

export function FormSelectGroup(props: { children: JSX.Element }) {
    return <div class="ln-select-group">{props.children}</div>
}