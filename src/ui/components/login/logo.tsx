import React from "react";

import lantern from "/ui/assets/lantern.svg";

import "./logo.scss";

export const Logo: React.FunctionComponent = React.memo(() => {
    return (
        <div className="ln-logo" >
            <img src={lantern}></img>
        </div>
    );
});

if(__DEV__) {
    Logo.displayName = "Logo";
}