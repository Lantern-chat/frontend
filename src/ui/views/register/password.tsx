import React from "preact/compat";

import { FormGroup, FormLabel, FormInput, FormText, FormSelect, FormSelectOption } from "ui/components/form";

const SYMBOLS = /[^\d\w]+/g;
const NUMERIC = /\d+/g;
const ALPHABE = /\w+/ig;

const N_MULT_LENGTH = 4;

export function calcPasswordStrength(pwd: string): number {
    let length = pwd.length;

    if(length < 8) {
        return 0;
    }

    let score = length * N_MULT_LENGTH;


    return Math.min(Math.floor(score / 20), 4);
}