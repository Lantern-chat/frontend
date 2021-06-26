import React from "react";

import { mainReducer, Type } from "state/main";
import { GLOBAL, STORE, DYNAMIC_MIDDLEWARE } from "state/global";
import { mainMiddleware } from "state/middleware/main";

STORE.replaceReducer(mainReducer);
DYNAMIC_MIDDLEWARE.addMiddleware(mainMiddleware);

let session = STORE.getState().user.session;

if(session) {
    STORE.dispatch({ type: Type.SESSION_LOGIN, session });
}

import Gateway from "worker-loader!worker/gateway";

if(!GLOBAL.gateway) {
    GLOBAL.gateway = new Gateway();

    GLOBAL.gateway.addEventListener('message', msg => {
        let data = msg.data;
        if(typeof data === 'string') {
            data = JSON.parse(data);
        }
        if(typeof data.p === 'string') {
            console.log(data.p);
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
import { CreatePartyModal } from "./modals/create_party";

import "./main.scss";

export const MainView: React.FunctionComponent = React.memo(() => {
    //let { parts } = useSelector(selectPath);

    return (
        <div className="ln-main">
            <PartyList />

            <CreatePartyModal />

            <Party />

            {/*
            <Switch>
                <Route path="/channels/@me/:channel">
                    Direct Message
                    </Route>
                <Route path="/channels/@me">
                    User Home
                    </Route>
                <Route path={["/channels/:party/:channel", "/channels/:party"]}>
                    <Party />
                </Route>
                <Route>
                    <Redirect to="/channels/@me"></Redirect>
                </Route>
            </Switch>
            */}
        </div>
    );
});
export default MainView;