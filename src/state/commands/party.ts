import { fetch, XHRMethod } from "lib/fetch";
import { DispatchableAction, Type } from "state/actions";
import { Room, Snowflake } from "state/models";

export function activateParty(party_id: Snowflake): DispatchableAction {
    return async (dispatch, getState) => {
        let state = getState(), party = state.party.parties.get(party_id);

        if(party && !party.needs_refresh) {
            return;
        }

        try {
            // TODO: Handle errors
            let res = await fetch({
                url: `/api/v1/party/${party_id}/rooms`,
                method: XHRMethod.GET,
                bearer: state.user.session!.auth,
            });

            if(res.status == 200) {
                dispatch({ type: Type.PARTY_LOADED, party_id, rooms: res.response });

                dispatch(loadMembers(party_id));
            }
        }
        catch(e) {
            __DEV__ && alert("Error getting party")
        }
    }
}

export function loadMembers(party_id: Snowflake): DispatchableAction {
    return async (dispatch, getState) => {
        let state = getState();

        try {
            let res = await fetch({
                url: `/api/v1/party/${party_id}/members`,
                method: XHRMethod.GET,
                bearer: state.user.session!.auth,
            });

            if(res.status == 200) {
                dispatch({ type: Type.MEMBERS_LOADED, party_id, members: res.response });
            }

        } catch(e) {
            __DEV__ && alert("Error getting members");
        }
    };
}