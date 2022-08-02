import { createStore } from "solid-js/store";

export function createReducer<S extends {}, A>(reducer: (state: S, action: A) => S, initial: S): [state: S, dispatch: (action: A) => void] {
    let [state, setState] = createStore(initial);

    return [state, (action: A) => setState(state => reducer(state as S, action))]
}