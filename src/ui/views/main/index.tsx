import React, { useEffect } from "react";
import { createStore, applyMiddleware } from "redux";
import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';

import { Provider } from "react-redux";
import { rootReducer, Type } from "state/main";


import Gateway from "worker-loader!../../../worker/gateway";
export const GATEWAY = new Gateway();

export const STORE = createStore(rootReducer, applyMiddleware(thunk, createLogger()));

window.addEventListener('resize', () => {
    STORE.dispatch({ type: Type.WINDOW_RESIZE });
});

GATEWAY.addEventListener('message', msg => {
    let data = msg.data;
    if(typeof data === 'string') {
        data = JSON.parse(data);
    }
    STORE.dispatch({ type: Type.GATEWAY_EVENT, payload: data });
});

//GATEWAY.addEventListener('error', err => {
//    STORE.dispatch({ type: 'GATEWAY_ERROR', payload: err });
//});

import { Redirect, Route, Switch } from "react-router-dom";

import { PartyList } from "./components/party_list";
import { Party } from "./components/party/party";
import { CreatePartyModal } from "./modals/create_party";

import { ISession } from "lib/session";
export interface MainViewParameters {
    session: ISession,
}

// Process:

// 1. Login is successful, session is set to a non-null value
// 2. Login redirects to main view
// 3. Main view loads and triggers the loading of the worker thread
// 4. Main view creates an empty Redux store
//     * All events from the worker are forwarded into the redux store dispatch
// 5. Main view mounts, dispatching the "MOUNT" event
// 6. When both "MOUNT" and "GATEWAY_INIT" events are received, the reducer sends a message to the worker with the session auth token for identifying.
// 7. After identification, the server returns the `Ready` event, which is sent to redux via the worker and contains everything to initialize the user, parties and channels.

import "./main.scss";
export const MainView: React.FunctionComponent<MainViewParameters> = ({ session }: MainViewParameters) => {
    useEffect(() => {
        STORE.dispatch({ type: Type.MOUNT, payload: session });
        return () => { STORE.dispatch({ type: Type.UNMOUNT }); };
    }, [session]);

    return (
        <Provider store={STORE}>
            <div className="ln-main">
                <PartyList />

                <CreatePartyModal />

                <Switch>
                    <Route path="/channels/@me/:channel">
                        Direct Message
                    </Route>
                    <Route path="/channels/@me">
                        User Home
                    </Route>
                    <Route path="/channels/:party/:channel">
                        <Party />
                    </Route>
                    <Route>
                        <Redirect to="/channels/@me"></Redirect>
                    </Route>
                </Switch>
            </div>
        </Provider>
    );
};
export default MainView;