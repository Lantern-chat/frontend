import { untrack } from "solid-js";
import { createStore, DeepReadonly } from "solid-js/store";

export function createReducer<S, A>(reducer: (state: DeepReadonly<S>, action: A) => S, initial: S): [state: DeepReadonly<S>, dispatch: (action: A) => void] {
    let [state, setState] = createStore(initial);

    return [state, (action: A) => setState(untrack(() => reducer(state as DeepReadonly<S>, action)))]
}