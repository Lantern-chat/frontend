import { fetch, XHRMethod } from "lib/fetch";
import { DispatchableAction, Type } from "state/actions";
import { Room, Snowflake } from "../models";

export function activateParty(party_id: Snowflake): DispatchableAction {
    return async (dispatch, getState) => {
        let state = getState();

        let existing_rooms = state.party.parties.get(party_id)?.rooms;
        if(existing_rooms != null && existing_rooms.length > 0) {
            return;
        }

        // TODO: Handle errors
        let res = await fetch({
            url: `/api/v1/party/${party_id}/rooms`,
            method: XHRMethod.GET,
            bearer: state.user.session!.auth,
        });

        if(res.status == 200) {
            dispatch({ type: Type.ROOMS_LOADED, rooms: res.response });
        }
    }
}