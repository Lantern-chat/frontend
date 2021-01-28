import Preact from "preact/compat";

import { createStore } from "redux";
import { useSelector, Provider, useStore } from "react-redux";
import { LanternStore } from "models/store";

const lantern_store = createStore((state: LanternStore) => state);

export const MainView: Preact.FunctionComponent = () => {
    return (
        <Provider store={lantern_store}>
            <div>Hello, World!</div>
        </Provider>
    );
};