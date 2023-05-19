import { GetMember } from "client-sdk/src/api/commands/party";
import { GetUser } from "client-sdk/src/api/commands/user";
import { DispatchableAction, Type } from "state/actions";
import { CLIENT } from "state/global";
import { PartyMember, Snowflake, User } from "state/models";


export function fetch_profile(user_id: Snowflake, party_id?: Snowflake, on_finish?: () => void): DispatchableAction {
    return async (dispatch) => {
        try {
            let user_or_member = await (party_id ? CLIENT.execute(GetMember({ party_id, user_id })) : CLIENT.execute(GetUser({ user_id })));
            let user = "user" in user_or_member ? user_or_member.user : user_or_member;

            dispatch({
                type: Type.USER_FETCHED,
                user, party_id,
                // graceful fallback to default profile if there is none
                profile: user.profile || { bits: 0 }
            });

            on_finish?.();
        } catch {
            __DEV__ && alert("Error getting profile");
        }
    };
}