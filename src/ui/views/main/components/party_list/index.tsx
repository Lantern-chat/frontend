import React from "react";
import { Avatar } from "ui/components/common/avatar";

import "./party_list.scss";

export const PartyList = React.memo(() => {
    let dummy_data = ['A', 'B', 'C', 'D'];
    let colors = ['yellow', 'lightblue', 'lightgreen', 'lightcoral'];

    // TODO: Improve scrollbar look
    return (
        <ul className="ln-party-list ln-vertical-scroll ln-scroll-fixed">
            {dummy_data.map((text, i) => (
                <li key={i}>
                    <Avatar rounded text={text} username={text} backgroundColor={colors[i]}></Avatar>
                </li>
            ))}
        </ul>
    );
});
if(process.env.NODE_ENV !== 'production') {
    PartyList.displayName = "PartyList";
}