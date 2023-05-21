import * as MISTAKES from "./mistakes.json";

export interface Mistake {
    name: string,
    value: string,
}

let cached: Array<any> = MISTAKES;

export function mistake(text: string): Mistake | undefined {
    let i = 0;
    while(i < cached.length) {
        let m, re: string | RegExp = cached[i + 1];
        if(!(re instanceof RegExp)) {
            let flags = '';
            if(re.startsWith('(?i)')) {
                flags = 'i';
                re = re.slice(4);
            }
            re = cached[i + 1] = new RegExp(re, flags);
        }

        if(m = text.match(re as RegExp)) {
            return {
                name: cached[i],
                value: m[0],
            };
        }

        i += 2;
    }

    return;
}