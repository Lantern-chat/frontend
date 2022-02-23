import { NAV_TIMEOUT } from "config/base";
import { room_url } from "config/urls";
import { DispatchableAction, Type } from "state/actions";
import { CLIENT, HISTORY } from "state/global";
import { Room, Snowflake } from "state/models";

import { GetPartyMembers, GetPartyRooms } from "client-sdk/src/api/commands/party";
import { batch } from "react-redux";

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
            HISTORY.pm(room_url(party_id, room_id || get_default_room(party.rooms)));

            return;
        }

        try {
            let navigated = false, nav_timeout = setTimeout(() => {
                HISTORY.pm(room_url(party_id, room_id)); navigated = true;
            }, NAV_TIMEOUT);

            // TODO: Handle errors
            let rooms = await CLIENT.execute(GetPartyRooms({ party_id }));

            batch(() => {
                dispatch({ type: Type.PARTY_LOADED, party_id, rooms });
                dispatch(loadMembers(party_id));
            });

            let new_room_id = room_id || get_default_room(rooms),
                url = room_url(party_id, new_room_id);

            if(HISTORY.location.pathname != url) {
                __DEV__ && console.log("HERE: ", HISTORY.location.pathname, url);

                // if the nav timeout hasn't run yet, just do a regular push
                if(!navigated) {
                    HISTORY.pm(url);
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
    return async (dispatch) => {
        try {
            dispatch({
                type: Type.MEMBERS_LOADED, party_id,
                members: await CLIENT.execute(GetPartyMembers({ party_id }))
            });

        } catch(e) {
            __DEV__ && alert("Error getting members");
        }
    };
}