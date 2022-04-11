import { shallowEqualArrays, shallowEqualObjects } from "lib/compare";
import { Accessor, createMemo } from "solid-js";

export type CompareHint<T> =
    | T extends Array<any> ? 'array' : never
    | T extends object ? 'object' : never;

export function createShallowMemo<T>(value: Accessor<T>, hint?: CompareHint<T>): Accessor<T> {
    return createMemo(value, undefined, {
        equals: hint == 'array' ? shallowEqualArrays as any :
            hint == 'object' ? shallowEqualObjects : (prev, curr) => {
                if(prev === curr) return true;

                // order curr first so numbers/strings fail early
                if(typeof curr === 'object' && typeof prev === 'object') {
                    if(Array.isArray(prev) && Array.isArray(curr)) {
                        return shallowEqualArrays(prev, curr);
                    }

                    return shallowEqualObjects(prev, curr);
                }

                // not same value, not same type
                return false;
            }
    });
}