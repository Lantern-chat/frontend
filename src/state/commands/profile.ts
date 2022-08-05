import { GetMemberProfile } from "client-sdk/src/api/commands";
import { GetUserProfile } from "client-sdk/src/api/commands/user";
import { DispatchableAction, Type } from "state/actions";
import { CLIENT } from "state/global";
import { Snowflake } from "state/models";


export function fetch_profile(user_id: Snowflake, party_id?: Snowflake): DispatchableAction {
    return async (dispatch) => {
        try {
            let profile = await CLIENT.execute(party_id ? GetMemberProfile({ party_id, user_id }) : GetUserProfile({ user_id }));

            dispatch({
                type: Type.PROFILE_FETCHED,
                user_id, party_id, profile
            });
        } catch {
            __DEV__ && alert("Error getting profile");
        }
    };
}