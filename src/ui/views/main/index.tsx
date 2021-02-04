import React, { useContext } from "react";

import { createStore } from "redux";
import { useSelector, Provider, useStore } from "react-redux";
import { LanternStore } from "models/store";
import { Link, Route, Switch } from "react-router-dom";

import { rootReducer } from "./reducers";
const lantern_store = createStore(rootReducer);

import { PartyList } from "./components/party_list";
import { Party } from "./subviews/party";


import "./main.scss";
export const MainView: React.FunctionComponent = () => {

    return (
        <Provider store={lantern_store}>
            <Switch>
                <Route path="/channels/:party/:channel">
                    <div className="ln-main-container">
                        <PartyList />

                        <Party />
                    </div>
                </Route>
            </Switch>
        </Provider>
    );
};
export default MainView;