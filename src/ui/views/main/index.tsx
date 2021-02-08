import React, { useContext } from "react";

import { createStore } from "redux";
import { useSelector, Provider, useStore } from "react-redux";
import { LanternStore } from "models/store";
import { Link, Route, Switch } from "react-router-dom";

import { rootReducer } from "./reducers";
const lantern_store = createStore(rootReducer);

import { PartyList } from "./components/party_list";
import { Party } from "./components/party/party";

window.addEventListener('resize', () => {
    lantern_store.dispatch({ type: 'WINDOW_RESIZE' });
});

import "./main.scss";
export const MainView: React.FunctionComponent = () => (
    <Provider store={lantern_store}>
        <div className="ln-main">
            <PartyList />

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