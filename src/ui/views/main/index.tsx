import React from "react";

import { mainReducer, Type } from "state/main";
import { GLOBAL, STORE, DYNAMIC_MIDDLEWARE, HISTORY } from "state/global";
import { mainMiddleware } from "state/middleware/main";

STORE.replaceReducer(mainReducer);
DYNAMIC_MIDDLEWARE.addMiddleware(mainMiddleware);

let session = STORE.getState().user.session;

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

import { PartyList } from "./components/party_list";
import { Party } from "./components/party/party";
import MainModals from "./modals";

import "./main.scss";
import { useSelector } from "react-redux";
import { RootState } from "state/root";
import { Panel } from "state/reducers/window";

export const MainView: React.FunctionComponent = React.memo(() => {
    //let { parts } = useSelector(selectPath);

    let is_right_view = useSelector((state: RootState) => state.window.use_mobile_view && state.window.show_panel == Panel.RightSidebar);

    let party_list = is_right_view ? null : <PartyList />;

    return (
        <div className="ln-main">
            {party_list}

            <Party />

            <MainModals />
        </div>
    );
});
export default MainView;

if(__DEV__) {
    MainView.displayName = "MainView";
}