import { NAV_TIMEOUT } from "config/base";
import { room_url } from "config/urls";
import { fetch, XHRMethod } from "lib/fetch";
import { DispatchableAction, Type } from "state/actions";
import { HISTORY } from "state/global";
import { Room, Snowflake } from "state/models";
import { RootState } from "state/root";

function get_default_room(rooms: Room[]): Snowflake | undefined {
    let default_room, any_room;
    for(let room of rooms) {
        any_room = room.id;
        if((room.flags & (1 << 5)) != 0) {
            default_room = room.id;
            break;
        }
    }

    return default_room || any_room;
}

export function activateParty(party_id: Snowflake, room_id?: Snowflake): DispatchableAction {
    return async (dispatch, getState) => {
        let state = getState(), party = state.party.parties.get(party_id);

        if(party && !party.needs_refresh) {
            HISTORY.push(room_url(party_id, room_id || get_default_room(party.rooms)));

            return;
        }

        try {
            let navigated = false, nav_timeout = setTimeout(() => {
                HISTORY.push(room_url(party_id, room_id)); navigated = true;
            }, NAV_TIMEOUT);

            // TODO: Handle errors
            let res = await fetch({
                url: `/api/v1/party/${party_id}/rooms`,
                method: XHRMethod.GET,
                bearer: state.user.session!.auth,
            });

            // TODO: Handle errors
            if(res.status == 200) {
                let rooms: Room[] = res.response;

                dispatch({ type: Type.PARTY_LOADED, party_id, rooms });
                dispatch(loadMembers(party_id));

                let new_room_id = room_id || get_default_room(rooms),
                    url = room_url(party_id, new_room_id);

                // if the nav timeout hasn't run yet, just do a regular push
                if(!navigated) {
                    HISTORY.push(url);
                } else if(!room_id || !rooms.find(room => room.id == room_id)) {
                    // otherwise, if the room_id given was invalid, replace with a valid one
                    HISTORY.replace(url);
                }
            }

            clearTimeout(nav_timeout);
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