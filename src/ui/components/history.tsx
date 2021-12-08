import React, { AnchorHTMLAttributes, forwardRef, useContext, createContext, Context } from 'react';
import { History, State, Location } from 'history';

import { IHistoryState } from "state/reducers/history";
import { HISTORY, IHistoryExt } from 'state/global';
import { IS_MOBILE } from 'lib/user_agent';
export { recomputeHistoryContext } from "state/reducers/history";

export const HistoryContext: Context<IHistoryState> = createContext<IHistoryState>(null!);

export interface ILinkProps extends AnchorHTMLAttributes<HTMLElement> {
    noAction?: boolean,
    state?: State,
    replace?: boolean,
    useDiv?: boolean,
    onNavigate?: (e: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>) => void,
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

function isSameHistory(a: Location) {
    return a.pathname == HISTORY.location.pathname;
}

function noop() { }

export const Link = React.memo(forwardRef((props: ILinkProps, ref: React.MutableRefObject<any>) => {
    let { href, onClick, onTouchEnd, onNavigate, replace, state, target, useDiv, noAction } = props,
        ctx = useContext(HistoryContext),
        history = ctx.history,
        method = (IS_MOBILE || replace) ? history.replace : history.pushMobile;

    if(href) {
        var ran_onNavigate = false;
        props = {
            ...props,
            onClick: (event: React.MouseEvent<HTMLElement>) => {
                !ran_onNavigate && callEventHandler(event, onNavigate); ran_onNavigate = true;
                callEventHandler(event, onClick);

                if(noAction) { event.preventDefault(); }

                // canNavigate + ignore everything but left clicks
                else if(canNavigate(target, event) && event.button === 0) {
                    event.preventDefault();
                    method(href!, state);
                }
            },
            onTouchEnd: (event: React.TouchEvent<HTMLElement>) => {
                !ran_onNavigate && callEventHandler(event, onNavigate); ran_onNavigate = true;
                callEventHandler(event, onTouchEnd);

                if(noAction) { event.preventDefault(); }
                else if(canNavigate(target, event)) {
                    event.preventDefault();
                    method(href!, state);
                }
            }
        };

        // silence warning about these
        if(__DEV__) {
            delete props['useDiv'];
            delete props['replace'];
            delete props['onNavigate'];
            delete props['noAction'];
        }
    }

    return useDiv ? <div {...props} ref={ref} /> : <a {...props} ref={ref} />
}));

if(__DEV__) {
    Link.displayName = "Link";
}