import React, { useEffect } from "react";
import { createStore, applyMiddleware } from "redux";
import thunk from 'redux-thunk';

import { Provider } from "react-redux";
import { rootReducer } from "./state";


import Gateway from "worker-loader!../../../worker/gateway";
export const GATEWAY = new Gateway();

export const STORE = createStore(rootReducer, applyMiddleware(thunk));

window.addEventListener('resize', () => {
    STORE.dispatch({ type: 'WINDOW_RESIZE' });
});

GATEWAY.addEventListener('message', msg => {
    STORE.dispatch({ type: 'GATEWAY_MESSAGE', payload: msg.data });
});

GATEWAY.addEventListener('error', err => {
    STORE.dispatch({ type: 'GATEWAY_ERROR', payload: err });
});

import { Redirect, Route, Switch } from "react-router-dom";

import { PartyList } from "./components/party_list";
import { Party } from "./components/party/party";
import { CreatePartyModal } from "./modals/create_party";

import "./main.scss";
export const MainView: React.FunctionComponent = () => {
    useEffect(() => {
        STORE.dispatch({ type: "MOUNT" });
        return () => { STORE.dispatch({ type: "UNMOUNT" }); };
    }, []);

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