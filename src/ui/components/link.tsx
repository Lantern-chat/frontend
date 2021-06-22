import React, { AnchorHTMLAttributes, forwardRef, useContext } from 'react';
import { State } from 'history';
import { HistoryContext } from 'ui/hooks/useHistory';

export interface ILinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
    state?: State,
    replace?: boolean,
}

export const Link = React.memo(forwardRef((props: ILinkProps, ref: React.MutableRefObject<HTMLAnchorElement>) => {
    let { href, onClick, replace, state, target } = props,
        history = useContext(HistoryContext),
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