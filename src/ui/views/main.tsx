import React, { useEffect, useState, useContext } from "react";
import { fetch } from "../../client/fetch";
import { delay, wrapPromise } from "../../client/util";
import { i18n, Translation as T } from "../i18n";
import { Timestamp } from "../components/common/timestamp";
import { IBuildConfig } from "src/client/interfaces";
import { ClientContext } from "../../models/client";
import { MessageBoard } from "../components/chat/board";

//function fetchBuild() {
//    return fetch("/api/v1/build").then((xhr) => (
//        <span>{JSON.stringify(xhr.response)}</span>
//    ));
//}

function displayBuild(build: IBuildConfig | null) {
    if(build) {
        return <>{JSON.stringify(build)}</>;
    } else {
        return null;
    }
}

export default function MainView() {
    // Initialize the state with a dummy read function, as it's called on the first render and must be valid below
    // Setting it to return null will skip rendering any part of it
    let client = useContext(ClientContext)();

    //let [buildRead, setBuild] = useState({ read: () => null } as any);
    //let [startTransition, isPending] = React.unstable_useTransition();

    ///* Calling read here will eith throw the promise, or return the resolved data from above */
    //let build = displayBuild(buildRead.read());

    //// Setup transition, which will track `setBuild`'s call
    //let onMouseUp = () => startTransition(() => {
    //    // hypothetical loading that returns the data
    //    let promise = delay(1000).then(() => fetch("/api/v1/build").then((xhr) => xhr.response));
    //
    //    // Ensure that the object given as the build state is a "wrapped" promise
    //    setBuild(wrapPromise(promise))
    //});

    let [msgs, setMsgs] = useState<string[]>([]);
    useEffect(() => {
        client.sub("test", () => {
            msgs.push("test");
            setMsgs(msgs);
        })
    }, []);

    return (
        <>
            <div className="ln-secondary-surface-background" style={{ height: '100%', position: 'relative', display: 'flex' }}>
                <MessageBoard />
            </div>
        </>
    );
};
