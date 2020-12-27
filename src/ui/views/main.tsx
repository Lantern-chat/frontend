import React, { useEffect } from "react";
import { fetch } from "../../client/fetch";
import { delay, wrapPromise } from "../../client/util";
import { i18n, Translation as T } from "../i18n";
import { Timestamp } from "../components/common/timestamp";
import { BuildConfig } from "src/client/interfaces";

//function fetchBuild() {
//    return fetch("/api/v1/build").then((xhr) => (
//        <span>{JSON.stringify(xhr.response)}</span>
//    ));
//}

function displayBuild(build: BuildConfig | null) {
    if(build) {
        return <>{JSON.stringify(build)}</>;
    } else {
        return null;
    }
}

export default function MainView() {
    // Initialize the state with a dummy read function, as it's called on the first render and must be valid below
    // Setting it to return null will skip rendering any part of it
    let [buildRead, setBuild] = React.useState({ read: () => null } as any);
    let [startTransition, isPending] = React.unstable_useTransition();

    /* Calling read here will eith throw the promise, or return the resolved data from above */
    let build = displayBuild(buildRead.read());

    // Setup transition, which will track `setBuild`'s call
    let onMouseUp = () => startTransition(() => {
        // hypothetical loading that returns the data
        let promise = delay(1000).then(() => fetch("/api/v1/build").then((xhr) => xhr.response));

        // Ensure that the object given as the build state is a "wrapped" promise
        setBuild(wrapPromise(promise))
    });

    return (
        <div>
            <button disabled={isPending} onMouseUp={onMouseUp}>Load Content</button>
            {isPending ? "Loading..." : build}
        </div>
    );
};
