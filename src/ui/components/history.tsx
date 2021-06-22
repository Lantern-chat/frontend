import React, { AnchorHTMLAttributes, forwardRef, useContext, createContext, Context } from 'react';
import { History, State, Location } from 'history';

export interface IHistoryContext {
    history: History,
    location: Location,
    parts: string[]
}

export const HistoryContext: Context<IHistoryContext> = createContext<IHistoryContext>(null!);

export function recomputeHistoryContext(history: History): IHistoryContext {
    let location = history.location,
        parts = location.pathname.slice(1).split('/');

    return { history, location, parts };
}

export interface ILinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
    state?: State,
    replace?: boolean,
}

export const Link = React.memo(forwardRef((props: ILinkProps, ref: React.MutableRefObject<HTMLAnchorElement>) => {
    let { href, onClick, replace, state, target } = props,
        ctx = useContext(HistoryContext),
        history = ctx.history,
        method = replace ? history.replace : history.push;

    if(href) {
        props = {
            ...props, onClick: (event: React.MouseEvent<HTMLAnchorElement>) => {
                if(onClick) {
                    try { onClick(event) } catch(ex) {
                        event.preventDefault();
                        throw ex;
                    }
                }

                if(
                    !event.defaultPrevented && // onClick prevented default
                    event.button === 0 && // ignore everything but left clicks
                    (!target || target === "_self") && // let browser handle "target=_blank" etc.
                    !(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey)) // ignore clicks with modifier keys
                {
                    event.preventDefault();
                    method(href!, state);
                }
            }
        };
    }

    return <a {...props} ref={ref} />
}));

if(process.env.NODE_ENV !== 'production') {
    Link.displayName = "Link";
}