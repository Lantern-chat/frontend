import React from "react";
import { createStore, applyMiddleware } from "redux";
import thunk from 'redux-thunk';

import { Provider } from "react-redux";
import { rootReducer } from "./state";

const lantern_store = createStore(rootReducer, applyMiddleware(thunk));

window.addEventListener('resize', () => {
    lantern_store.dispatch({ type: 'WINDOW_RESIZE' });
});

import { Route, Switch } from "react-router-dom";

import { PartyList } from "./components/party_list";
import { Party } from "./components/party/party";
import { CreatePartyModal } from "./modals/create_party";

import "./main.scss";
export const MainView: React.FunctionComponent = () => (
    <Provider store={lantern_store}>
        <div className="ln-main">
            <PartyList />

            <CreatePartyModal />

            <Switch>
                <Route path="/channels/@me/:channel">
                    Test
                </Route>
                <Route path="/channels/:party/:channel">
                    <Party />
                </Route>
            </Switch>
        </div>
    </Provider>
);
export default MainView;