import { Accessor, Context, createContext, createMemo, createSignal, JSX, mergeProps, splitProps, useContext } from "solid-js";
import { History, State, Location } from "history";

import { HISTORY, IHistoryExt } from "state/global";
import { Dynamic } from "solid-js/web";
import { MainContext } from "ui/hooks/useMain";

export interface ILinkProps extends JSX.AnchorHTMLAttributes<HTMLElement> {
    noAction?: boolean,
    state?: State,
    replace?: boolean,
    useDiv?: boolean,
    onNavigate?(): void,
    ref?: HTMLElement | ((el: HTMLElement) => void),
}

export function canNavigate(target: string | undefined, event: MouseEvent | TouchEvent): boolean {
    return (!target || target === "_self") && // let browser handle "target=_blank" etc.
        !(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey); // ignore clicks with modifier keys
}

function callEventHandler<T extends UIEvent>(event: T, handler?: JSX.EventHandler<HTMLElement, T>) {
    try { handler?.(event as any) } catch(ex) {
        event.preventDefault();
        throw ex;
    }
}

//function isSameHistory(a: Location) {
//    return a.pathname == HISTORY.location.pathname;
//}

export function Link(props: ILinkProps) {
    let main = useContext(MainContext);
    let method = () => props.replace ? HISTORY.replace : HISTORY.pm;

    let onClick = async (event: MouseEvent) => {
        event.preventDefault(); // must be called before any async parts

        if(!(await main.tryNav(props.href))) {
            return;
        }

        if(!props.href) {
            return callEventHandler(event, props.onClick as any);
        }

        props.onNavigate?.();
        callEventHandler(event, props.onClick as any);

        // canNavigate + ignore everything but left clicks
        if(!props.noAction && canNavigate(props.target, event) && event.button === 0) {
            method()(props.href!, props.state);
        }
    };

    let onTouchEnd = async (event: MouseEvent) => {
        event.preventDefault(); // must be called before any async parts

        if(!(await main.tryNav(props.href))) {
            return;
        }

        if(!props.href) {
            return callEventHandler(event, props.onTouchEnd as any);
        }

        props.onNavigate?.();
        callEventHandler(event, props.onTouchEnd as any);

        if(!props.noAction && canNavigate(props.target, event)) {
            method()(props.href!, props.state);
        }
    };

    // NOTE: useDiv is a permenant choice
    return props.useDiv ?
        <div {...props as any} onClick={onClick} onTouchEnd={onTouchEnd} /> :
        <a {...props as any} onClick={onClick} onTouchEnd={onTouchEnd} />;
}