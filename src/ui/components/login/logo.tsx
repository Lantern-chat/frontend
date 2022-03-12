import lantern from "/ui/assets/lantern.svg";

import "./logo.scss";

export function Logo() {
    return (
        <div className="ln-logo" >
            <img src={lantern}></img>
        </div>
    );
}