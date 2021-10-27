import React, { createContext, useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import throttle from 'lodash/throttle';

import { RootState } from "state/root";
import { mainReducer, Type } from "state/main";
import { GLOBAL, STORE, DYNAMIC_MIDDLEWARE, HISTORY, IGatewayWorker } from "state/global";
import { mainMiddleware } from "state/middleware/main";

DYNAMIC_MIDDLEWARE.addMiddleware(mainMiddleware);
STORE.replaceReducer(mainReducer);

let state = STORE.getState(),
    session = state.user.session;

STORE.dispatch({ type: Type.REFRESH_ACTIVE, ctx: state.history });

// if there is an existing session, fire off the login again to refresh parts of the state
if(session) {
    STORE.dispatch({ type: Type.SESSION_LOGIN, session });
} else {
    // otherwise, main view should never have been loaded so redirect to login
    HISTORY.replace('/login');
}

import Gateway from "worker-loader!worker/gateway";

// this script may be run multiple times if unlucky,
// so double-check the gateway hasn't already been created
if(!GLOBAL.gateway) {
    let gateway: any = new Gateway();
    gateway.postCmd = (cmd: GatewayCommand) => gateway.postMessage(cmd);
    GLOBAL.gateway = gateway as IGatewayWorker;

    GLOBAL.gateway.addEventListener('message', msg => {
        let data = msg.data;
        if(typeof data === 'string') {
            data = JSON.parse(data);
        }
        if(typeof data.p === 'string') {
            data.p = JSON.parse(data.p);
        }
        STORE.dispatch({ type: Type.GATEWAY_EVENT, payload: data });
    });
}

//GATEWAY.addEventListener('error', err => {
//    STORE.dispatch({ type: 'GATEWAY_ERROR', payload: err });
//});

import { Panel } from "state/reducers/window";
import { setPresence } from "state/commands/presence";
import { GatewayCommand } from "worker/gateway/cmd";
import { PartyList } from "./components/party_list";
import { Party } from "./components/party/party";
import MainModals from "./modals";

import { Hotkey, MainContext, OnClickHandler, OnKeyHandler, parseHotkey } from "ui/hooks/useMainClick";

import "ui/styles/lib/fonts/lato.css";
import "./main.scss";
export const MainView: React.FunctionComponent = React.memo(() => {
    //let { parts } = useSelector(selectPath);

    let dispatch = useDispatch();

    // User presence idle timer
    useEffect(() => {
        let w = window,
            timer_function = () => dispatch(setPresence(true)), // sets 'away' to true
            timer: ReturnType<typeof setTimeout>,
            events = ['mousemove', 'keydown', 'touchstart'],
            listener = throttle(() => {
                dispatch(setPresence(false)); // sets 'away' to false
                clearTimeout(timer);

                // since this listener function is run on any user movement,
                // it's basically certain to run at least once, so we
                // can cheat and set the first timeout here
                timer = setTimeout(timer_function, 1000 * 60 * 10); // 10 minutes
            }, 1000); // throttle to once per second at most

        events.forEach(e => w.addEventListener(e, listener));
        return () => { events.forEach(e => w.removeEventListener(e, listener)); clearTimeout(timer); }
    }, []);

    let handlers = useMemo(() => {
        var click_listeners: OnClickHandler[] = [];
        var key_listeners: { [key: number]: OnKeyHandler[] } = {};

        let addOnClick = (listener: OnClickHandler) => {
            click_listeners.push(listener);
        };

        let addOnHotkey = (hotkey: Hotkey, listener: OnKeyHandler) => {
            let listeners = key_listeners[hotkey];
            if(!listeners) {
                listeners = key_listeners[hotkey] = [];
            }
            listeners.push(listener);
        };

        let removeOnClick = (listener: OnClickHandler) => {
            click_listeners = click_listeners.filter(l => l != listener);
        };

        let removeOnHotkey = (hotkey: Hotkey, listener: OnKeyHandler) => {
            let listeners;
            if(listeners = key_listeners[hotkey]) {
                key_listeners[hotkey] = listeners.filter(l => l != listener);
            }
        };

        let clickAll = (e: React.MouseEvent) => {
            //__DEV__ && console.log(click_listeners);

            for(let listener of click_listeners) {
                listener(e);
            }
        };

        let triggerHotkey = (hotkey: Hotkey, e: React.KeyboardEvent) => {
            e.preventDefault();
            e.stopPropagation();

            let listeners = key_listeners[hotkey];
            if(listeners) {
                for(let listener of listeners) {
                    listener(e);
                }
            }
        };

        let triggerAnyHotkey = (e: React.KeyboardEvent) => {
            let hotkey = parseHotkey(e);
            if(hotkey) {
                if(__DEV__) {
                    console.log("Hotkey %s triggered", Hotkey[hotkey]);
                }
                triggerHotkey(hotkey, e);
            }
        }

        return {
            on_click: (e: React.MouseEvent) => clickAll(e),
            // by default, block real context menu. Placing it here caches it with memo
            on_cm: (e: React.MouseEvent) => e.preventDefault(),
            on_ku: (e: React.KeyboardEvent) => triggerAnyHotkey(e),
            // certain hotkeys cause side-effects, like Tab, so kill those
            on_kd: (e: React.KeyboardEvent) => { if(parseHotkey(e)) { e.preventDefault(); e.stopPropagation(); } },
            value: {
                addOnClick,
                addOnHotkey,
                removeOnClick,
                removeOnHotkey,
                clickAll,
                triggerHotkey,
                triggerAnyHotkey,
            }
        }
    }, []);


    // this chunk handles clearing context menus when the window/tab loses focus
    let main = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if(!main.current) return;
        let listener = () => main.current!.click();
        window.addEventListener('blur', listener);
        return () => window.removeEventListener('blur', listener);
    }, [main.current]);

    let is_right_view = useSelector((state: RootState) => state.window.use_mobile_view && state.window.show_panel == Panel.RightUserList);

    return (
        <div className="ln-main" ref={main} onClick={handlers.on_click} onContextMenu={handlers.on_cm} onKeyUp={handlers.on_ku} onKeyDown={handlers.on_kd}>
            <MainContext.Provider value={handlers.value}>
                {is_right_view ? null : <PartyList />}

                <Party />

                <MainModals />
            </MainContext.Provider>
        </div>
    );
});
export default MainView;

if(__DEV__) {
    MainView.displayName = "MainView";
}