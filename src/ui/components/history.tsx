import { Accessor, Context, createContext, createMemo, createSignal, JSX, mergeProps, splitProps, useContext } from "solid-js";
import { History, State, Location } from 'history';

import { IHistoryState, recomputeHistoryContext } from "state/mutators/history";
import { HISTORY, IHistoryExt } from 'state/global';
import { Dynamic } from "solid-js/web";

export const HistoryContext: Context<IHistoryState> = createContext<IHistoryState>(null!);

export interface ILinkProps extends JSX.AnchorHTMLAttributes<HTMLElement> {
    noAction?: boolean,
    state?: State,
    replace?: boolean,
    useDiv?: boolean,
    onNavigate?: JSX.EventHandler<HTMLElement, UIEvent>,
    ref?: HTMLElement | ((el: HTMLElement) => void),
}

export function canNavigate(target: string | undefined, event: MouseEvent | TouchEvent): boolean {
    return !event.defaultPrevented && // onClick prevented default
        (!target || target === "_self") && // let browser handle "target=_blank" etc.
        !(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey); // ignore clicks with modifier keys
}

function callEventHandler<T extends UIEvent>(event: T, handler?: JSX.EventHandler<HTMLElement, T>) {
    if(handler) {
        try { handler(event as any) } catch(ex) {
            event.preventDefault();
            throw ex;
        }
    }
}

//function isSameHistory(a: Location) {
//    return a.pathname == HISTORY.location.pathname;
//}

export function Link(props: ILinkProps) {
    let method = createMemo(() => props.replace ? HISTORY.replace : HISTORY.pm);

    let onClick = (event: MouseEvent) => {
        if(!props.href) {
            return callEventHandler(event, props.onClick as any);
        }

        callEventHandler(event, props.onNavigate);
        callEventHandler(event, props.onClick as any);

        if(props.noAction) { event.preventDefault(); }

        // canNavigate + ignore everything but left clicks
        else if(canNavigate(props.target, event) && event.button === 0) {
            event.preventDefault();
            method()(props.href!, props.state);
        }
    };

    let onTouchEnd = (event: MouseEvent) => {
        if(!props.href) {
            return callEventHandler(event, props.onTouchEnd as any);
        }

        callEventHandler(event, props.onNavigate);
        callEventHandler(event, props.onTouchEnd as any);

        if(props.noAction) { event.preventDefault(); }
        else if(canNavigate(props.target, event)) {
            event.preventDefault();
            method()(props.href!, props.state);
        }
    };

    let merged_props = mergeProps(props, { onClick, onTouchEnd });

    // NOTE: useDiv is a permenant choice
    return props.useDiv ? <div {...merged_props as any} /> : <a {...merged_props as any} />;
}