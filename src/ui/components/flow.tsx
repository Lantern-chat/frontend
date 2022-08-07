import { JSX, Show } from "solid-js";
import { createComponent } from "solid-js/web";

export interface BranchProps {
    children: Array<JSX.Element>
}

export function Branch(props: BranchProps): JSX.Element {
    let tail = props.children, branch: any = tail.shift();

    if(branch) {
        if(branch.i) {
            let fallback = tail.length ? () => <Branch>{tail}</Branch> : () => null;

            return createComponent(Show, {
                get when() { return branch.props.when; },
                get children() { return branch.props.children; },
                get fallback() { return fallback(); }
            });
        } else if(branch.e) {
            return branch.props.children;
        } else if(__DEV__) {
            throw new Error("Child of Branch not an If/ElseIf/Else!");
        }
    }

    return null;
}

interface IfProps<T> {
    when: T | undefined | null | false,
    children: JSX.Element | ((item: NonNullable<T>) => JSX.Element),
}

Branch.If = function If<T>(props: IfProps<T>) {
    return { i: 1, props } as unknown as JSX.Element;
};

Branch.ElseIf = function ElseIf<T>(props: IfProps<T>) {
    return { i: 1, props } as unknown as JSX.Element;
};

Branch.Else = function Else(props: { children: JSX.Element }) {
    return { e: 1, props } as unknown as JSX.Element;
};