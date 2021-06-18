import { Middleware } from "redux";
import { Action } from "../actions";

function isPromise(obj: any): boolean {
    return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
}

type DispatchExt = (action: Promise<Action>) => void;

export const promiseMiddleware: Middleware<DispatchExt> = ({ dispatch }) => next => (action: Action | Promise<Action>) => {
    return isPromise(action) ? (action as Promise<Action>).then(dispatch) : next(action as Action);
}