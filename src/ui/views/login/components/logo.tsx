import lantern from "/ui/assets/lantern.svg";

import "./logo.scss";

export function Logo() {
    return (
        <div class="ln-logo" >
            <img src={lantern} />
        </div>
    );
}