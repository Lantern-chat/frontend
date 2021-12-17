
import { fetch, XHRMethod, XHRParameters } from "lib/fetch";
import { DispatchableAction, Type } from "state/actions";
import { Action } from "state/root";

/*
import { UserPreferences } from "state/models";

export enum Endpoint {
    UserLogout,
    UserPrefs,
}

export type Api = UserLogout | UserPrefs;

export interface UserLogout {
    endpoint: Endpoint.UserLogout,
}

export interface UserPrefs {
    endpoint: Endpoint.UserPrefs,
    prefs: Partial<UserPreferences>,
}


export function query(api: Api): DispatchableAction {
    return (dispatch, getState) => {
        let url = '/api/v1/', method = XHRMethod.GET;

        switch(api.endpoint) {
            case Endpoint.UserLogout: {
                url += 'user/@me';
                method = XHRMethod.DELETE;
                break;
            }
            case Endpoint.UserPrefs: {
                url += 'user/@me/prefs';
                method = XHRMethod.PATCH;
                break;
            }
        }
    }
}
*/

export function api_fetch(args: XHRParameters): Promise<any> {
    args.url = '/api/v1' + args.url;
    return fetch(args).catch(error => ({ type: Type.API_ERROR, error } as Action));
}
