import { NAV_TIMEOUT } from "config/base";
import { room_url } from "config/urls";
import { DispatchableAction, Type } from "state/actions";
import { CLIENT, HISTORY } from "state/global";
import type { Room, Snowflake } from "state/models";

import { GetPartyMembers, GetPartyRooms } from "client-sdk/src/api/commands/party";
import { loadMessages } from "./message/load";

function get_default_room(rooms: Room[]): Snowflake | undefined {
    let any_room;
    for(let room of rooms) {
        any_room = room.id;
        if((room.flags & (1 << 5)) != 0) {
            return room.id;
        }
    }

    return any_room;
}

export function activateParty(party_id: Snowflake, room_id?: Snowflake): DispatchableAction {
    return async (dispatch, state) => {
        let party = state.party.parties[party_id];

        if(party && !party.needs_refresh) {
            HISTORY.pm(room_url(party_id, room_id || get_default_room(Object.values(party.rooms))));
            return;
        }

        let navigated = false, nav_timeout = setTimeout(() => {
            let url = room_url(party_id, room_id);

            if(HISTORY.location.pathname != url) {
                __DEV__ && console.log("Navigating forcefully...");
                HISTORY.pm(url); navigated = true;
            }
        }, NAV_TIMEOUT);

        try {
            // fire this off first so it can be loading, as it's unrelated to below
            dispatch(CLIENT.execute(GetPartyMembers({ party_id }))
                .then(members => ({ type: Type.MEMBERS_LOADED, party_id, members })));

            let rooms = await CLIENT.execute(GetPartyRooms({ party_id }));

            dispatch({ type: Type.PARTY_LOADED, party_id, rooms });

            let new_room_id = room_id || get_default_room(rooms),
                url = room_url(party_id, new_room_id);

            if(new_room_id && HISTORY.location.pathname != url) {
                __DEV__ && console.log("Fetching messages for", new_room_id);

                // fetch messages for the new party room, then navigate
                dispatch(loadMessages(new_room_id, undefined, undefined, () => {
                    __DEV__ && console.log("HERE: ", HISTORY.location.pathname, url);

                    // if the nav timeout hasn't run yet, just do a regular push
                    if(!navigated) {
                        HISTORY.pm(url);
                    } else if(!room_id || !rooms.find(room => room.id == room_id)) {
                        // otherwise, if the room_id given was invalid, replace with a valid one
                        HISTORY.replace(url);
                    }

                    clearTimeout(nav_timeout);
                }));
            }
        }
        catch(e) {
            clearTimeout(nav_timeout); // ensure this is cleared regardless

            __DEV__ && alert("Error getting party")
        }
    }
}