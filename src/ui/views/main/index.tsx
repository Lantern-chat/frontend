import React from "react";

import { createStore } from "redux";
import { useSelector, Provider, useStore } from "react-redux";
import { LanternStore } from "models/store";
import { Link } from "react-router-dom";

const lantern_store = createStore((state: LanternStore) => state);

export const MainView: React.FunctionComponent = () => {
    return (
        <div>There's nothing here yet, go home.</div>
    );
};
export default MainView;