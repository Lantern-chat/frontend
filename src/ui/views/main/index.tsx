import React from "react";

import { createStore } from "redux";
import { useSelector, Provider, useStore } from "react-redux";
import { LanternStore } from "models/store";
import { Link } from "react-router-dom";

const lantern_store = createStore((state: LanternStore) => state);

export const MainView: React.FunctionComponent = () => {
    return (

        <Link to="/login">Login</Link>


    );
};
export default MainView;