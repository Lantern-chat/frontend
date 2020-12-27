import React, { useEffect } from "react";
import { fetch } from "../../client/fetch";
import { delay } from "../../client/util";
import { i18n, Translation as T } from "../i18n";
import { Timestamp } from "../components/common/timestamp";

//function fetchBuild() {
//    return fetch("/api/v1/build").then((xhr) => (
//        <span>{JSON.stringify(xhr.response)}</span>
//    ));
//}

export default function MainView() {
    let [build, setBuild] = React.useState({});
    let [startTransition, isPending] = React.unstable_useTransition();


    useEffect(() => {
        delay(1000).then(() => fetch("/api/v1/build").then((xhr) => setBuild(xhr.response)));
    }, []);

    return (
        <div>
            <Timestamp time={Date.now()} />
            <br />
            {isPending ? "Loading..." : null}
            {JSON.stringify(build)}
        </div>
    );
};
