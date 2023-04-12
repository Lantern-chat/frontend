import { Accessor } from "solid-js";
import { composeSelectors, createStructuredSelector } from "solid-mutant";
import { RootState } from "state/root";

//export interface ISelectedPath {
//    path: string,
//    parts: string[]
//}

export const selectPath = composeSelectors<RootState>()([state => state.history.location.pathname], createStructuredSelector({
    path: (path: Accessor<string>) => path(),
    parts: (path: Accessor<string>) => path().slice(1).split("/")
}));
