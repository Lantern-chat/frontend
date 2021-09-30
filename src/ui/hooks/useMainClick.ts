import React, { createContext, useContext, useEffect, useCallback, useMemo } from "react";

export type OnClickHandler = (e: React.MouseEvent) => void;

export interface IMainContext {
    addOnClick: (listener: OnClickHandler) => void,
    removeOnClick: (listener: OnClickHandler) => void,
    clickAll: (e: React.MouseEvent) => void,
}

const noop = () => { };
export const MainContext = createContext<IMainContext>({ addOnClick: noop, removeOnClick: noop, clickAll: noop });

// TODO: Move this someplace useful
type ObjectFromList<T extends ReadonlyArray<string>, V = string> = {
    [K in (T extends ReadonlyArray<infer U> ? U : never)]: V
};

const EVENTS = ['onClick', 'onContextMenu', 'onTouch'] as const;

type ClickEventHandlers = Partial<ObjectFromList<typeof EVENTS, OnClickHandler>>;

export interface IMainClickOptions extends ClickEventHandlers {
    active: boolean,
    onMainClick: OnClickHandler,
}

// The behavior of this is a bit odd. All fields of opt are memoized except for `active`,
// which can be used to cheaply toggle the effect
export function useMainClick(opt: IMainClickOptions, deps: any[]): ClickEventHandlers {
    let main = useContext(MainContext), active = opt.active;

    // cache opt and props, including callbacks
    let res = useMemo(() => {
        let props: ClickEventHandlers = {};

        for(let key of EVENTS) {
            // block scoped, moved into closure
            let cb: OnClickHandler | undefined;
            if(cb = opt[key]) { // check undefined while assigning
                props[key] = (e: React.MouseEvent) => { main.clickAll(e); cb!(e); };
            }
        }

        return { opt, props };
    }, [main, ...deps]);

    useEffect(() => {
        if(!active) return;

        let listener = (e: React.MouseEvent) => res.opt.onMainClick(e);
        main.addOnClick(listener);
        return () => main.removeOnClick(listener);
    }, [active, res]); // res includes check for main

    return res.props;
}
