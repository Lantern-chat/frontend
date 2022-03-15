import { JSX, Show } from "solid-js";

export interface BranchProps {
    children: Array<JSX.Element>
}

export function Branch(props: BranchProps) {
    let tail = props.children, cur: any = tail.shift();

    if(cur) {
        if(cur._if) {
            let fallback = tail.length ? () => <Branch>{tail}</Branch> : undefined;

            return (
                <Show when={cur.props.when} fallback={fallback}>
                    {cur.props.children}
                </Show>
            );
        } else if(cur._else) {
            return cur.props.children;
        } else if(__DEV__) {
            throw new Error("Child of Branch not an If/ElseIf/Else!");
        }
    }
}

interface IfProps<T> {
    when: T | undefined | null | false,
    children: JSX.Element | ((item: NonNullable<T>) => JSX.Element),
}

Branch.If = function If<T>(props: IfProps<T>) {
    return { _if: true, props } as unknown as JSX.Element;
};

Branch.ElseIf = function ElseIf<T>(props: IfProps<T>) {
    return { _if: true, props } as unknown as JSX.Element;
};

Branch.Else = function Else(props: { children: JSX.Element }) {
    return { _else: true, props } as unknown as JSX.Element;
};