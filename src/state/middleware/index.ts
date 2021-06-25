import { AnyAction, compose, Middleware, Store, Dispatch as ReduxDispatch } from "redux";
import { Dispatch as LanternDispatch } from "../actions";

export interface DynamicMiddleware<DispatchExt = {}, S = any, D extends ReduxDispatch<AnyAction> = LanternDispatch> {
    enhancers: Middleware<DispatchExt, S, D>,
    addMiddleware: <T extends Middleware<DispatchExt, S, D>>(middleware: T) => void;
}

export function createDynamicMiddlewares<DispatchExt, S, A extends AnyAction>(): DynamicMiddleware<DispatchExt, S, LanternDispatch> {
    let middlewares: Middleware<{}, S, LanternDispatch>[] = [],
        composed = compose(),
        store: Store<S, A>,
        enhancers: Middleware<{}, S, LanternDispatch> = (_store: Store<S, A>) => {
            store = _store;
            return next => action => composed(next)(action);
        },
        addMiddleware = <T extends Middleware<DispatchExt, S, LanternDispatch>>(middleware: T) => {
            // deduplicate
            if(middlewares.indexOf(middleware) == -1) {
                middlewares.push(middleware);
                composed = compose(...middlewares.map(middleware => middleware(store)));
            }
        };

    return {
        enhancers,
        addMiddleware
    }
}