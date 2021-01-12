import React from "react";

import { Link } from "react-router-dom";

export default class RegisterView extends React.Component {
    render() {
        return (<div>
            <Link to={"/login"}>Login</Link>
        </div>);
    }
}