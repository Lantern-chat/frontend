import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import throttle from 'lodash/throttle';

import { RootState } from "state/root";
import { mainReducer, Type } from "state/main";
import { GLOBAL, STORE, DYNAMIC_MIDDLEWARE, HISTORY } from "state/global";
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
    GLOBAL.gateway = new Gateway();

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

import { PartyList } from "./components/party_list";
import { Party } from "./components/party/party";
import MainModals from "./modals";

import "./main.scss";
export const MainView: React.FunctionComponent = React.memo(() => {
    //let { parts } = useSelector(selectPath);

    let dispatch = useDispatch();

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

    let is_right_view = useSelector((state: RootState) => state.window.use_mobile_view && state.window.show_panel == Panel.RightUserList);

    return (
        <div className="ln-main">
            {is_right_view ? null : <PartyList />}

            <Party />

            <MainModals />
        </div>
    );
});
export default MainView;

if(__DEV__) {
    MainView.displayName = "MainView";
}