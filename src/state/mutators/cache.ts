import { Action, Type } from "state/actions";
import { PartyMember, Snowflake, User, UserPresence } from "state/models";
import { genCachedUserKey } from "state/selectors/selectCachedUser";
import { GatewayMessageDiscriminator } from "worker/gateway/msg";

export interface CachedUser {
    user: User,
    nickname?: string,
    party_id?: Snowflake,
    presence?: UserPresence,
}

export interface ICacheState {
    members: Map<Snowflake, CachedUser>,
}
