import React, { AnchorHTMLAttributes, forwardRef, useContext, createContext, Context } from 'react';
import { History, State, Location } from 'history';

import { IHistoryState } from "state/reducers/history";
export { recomputeHistoryContext } from "state/reducers/history";

export interface IHistoryContext {
    history: History,
    location: Location,
    parts: string[]
}

export const HistoryContext: Context<IHistoryState> = createContext<IHistoryState>(null!);

export interface ILinkProps extends AnchorHTMLAttributes<HTMLElement> {
    state?: State,
    replace?: boolean,
    useDiv?: boolean,
}

export function canNavigate(target: string | undefined, event: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>): boolean {
    return !event.defaultPrevented && // onClick prevented default
        (!target || target === "_self") && // let browser handle "target=_blank" etc.
        !(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey); // ignore clicks with modifier keys
}

function callEventHandler<T extends React.SyntheticEvent>(event: T, handler?: (event: T) => void) {
    if(handler) {
        try { handler(event) } catch(ex) {
            event.preventDefault();
            throw ex;
        }
    }
}

export const Link = React.memo(forwardRef((props: ILinkProps, ref: React.MutableRefObject<any>) => {
    let { href, onClick, onTouchEnd, replace, state, target, useDiv } = props,
        ctx = useContext(HistoryContext),
        history = ctx.history,
        method = replace ? history.replace : history.push;

    if(href) {
        props = {
            ...props,
            onClick: (event: React.MouseEvent<HTMLElement>) => {
                callEventHandler(event, onClick);
                // canNavigate + ignore everything but left clicks
                if(canNavigate(target, event) && event.button === 0) {
                    event.preventDefault();
                    method(href!, state);
                }
            },
            onTouchEnd: (event: React.TouchEvent<HTMLElement>) => {
                callEventHandler(event, onTouchEnd);
                if(canNavigate(target, event)) {
                    event.preventDefault();
                    method(href!, state);
                }
            }
        };
    }

    return useDiv ? <div {...props} ref={ref} /> : <a {...props} ref={ref} />
}));

if(__DEV__) {
    Link.displayName = "Link";
}