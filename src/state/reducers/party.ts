import produce from "immer";
import { GatewayMessageDiscriminator } from "worker/gateway/msg";
import { PartyMember, Role } from "state/models";
import { Action, Type } from "../actions";

import { Snowflake, Party, Room } from "../models";
import { GatewayEventCode } from "worker/gateway/event";
import { computeRoleColor } from "state/selectors/party";
import { shallowEqualArrays } from "lib/compare";

export interface IParty {
    party: Party,
    rooms: Room[],
    members: Map<Snowflake, PartyMember>,

    /// Cached colors for users
    ///
    /// TODO: Maybe store a reference to an object containing the string,
    /// instead of the string itself? Depends on how string refs work.
    member_colors: Map<Snowflake, string>,

    /// Reverse lookup mapping role_id -> Set of user_ids
    ///
    /// Useful for finding which user's colors should be updated when a role updates
    role_members: Map<Snowflake, Set<Snowflake>>,

    /// If true, party will be refetched on activation
    needs_refresh: boolean,
}

export interface IPartyState {
    parties: Map<Snowflake, IParty>,
    roles: Map<Snowflake, Role>,
    last_channel: Map<Snowflake, Snowflake>,
    active_party?: Snowflake,
    //sorted: Snowflake[]
}

const DEFAULT_STATE: IPartyState = {
    parties: new Map(),
    roles: new Map(),
    last_channel: new Map(),
    //sorted: [],
};

export function partyReducer(state: IPartyState | null | undefined, action: Action) {
    state = state || DEFAULT_STATE;

    switch(action.type) {
        case Type.SESSION_EXPIRED: return DEFAULT_STATE;

        case Type.PARTY_LOADED: return produce(state, draft => {
            let party = draft.parties.get(action.party_id);

            if(party) {
                action.rooms.sort((a, b) => a.position - b.position);

                for(let room of action.rooms) {
                    if(__DEV__ && room.party_id !== action.party_id) {
                        alert("Mismatch in fetched rooms!");
                    }

                    party.rooms.push(room);
                }

                party.needs_refresh = false;
            }
        });
        case Type.MEMBERS_LOADED: return produce(state, draft => {
            let party = draft.parties.get(action.party_id), roles = draft.roles;
            if(!party) return;

            for(let member of action.members) {
                let user = member.user;

                // set the member structure easily enough
                party.members.set(user.id, member);

                // if the member has any roles, process those
                let member_roles = member.roles;
                if(!member_roles || !member_roles.length) continue;

                for(let role_id of member_roles) {
                    let role_members = party.role_members.get(role_id);
                    if(!role_members) {
                        party.role_members.set(role_id, role_members = new Set());
                    }
                    role_members.add(user.id);
                }

                // start with the highest role, double-checking it exists
                let highest_role = roles.get(member_roles[0]);
                if(!highest_role) continue;

                // iterate over user roles
                for(let role_id of member_roles.slice(1)) {
                    let new_role = roles.get(role_id);
                    if(!new_role || new_role.color == null) continue;

                    // find the role with the "highest" (lowest position), or if the
                    // initial highest role had no color pick the first matching
                    if(new_role.position < highest_role.position || highest_role.color == null) {
                        highest_role = new_role;
                    }
                }

                // if a color was found, cache it
                if(highest_role.color != null) {
                    party.member_colors.set(user.id, computeRoleColor(highest_role)!);
                }
            }
        });
        case Type.HISTORY_UPDATE: {
            let [, party_id, channel_id] = action.ctx.parts;

            return produce(state, draft => {
                let party = draft.parties.get(party_id);
                if(party) {
                    let room = party.rooms.find(room => room.id == channel_id);

                    if(room) {
                        draft.last_channel.set(party_id, channel_id);
                    }
                }
            });
        }
        case Type.GATEWAY_EVENT: {
            switch(action.payload.t) {
                case GatewayMessageDiscriminator.Ready: {
                    let p = action.payload.p;

                    let roles: Map<Snowflake, Role> = new Map();
                    let parties: Map<Snowflake, IParty> = new Map();

                    for(let party of p.parties) {
                        parties.set(party.id, {
                            party,
                            rooms: [],
                            members: new Map(),
                            needs_refresh: true,
                            member_colors: new Map(),
                            role_members: new Map(),
                        });

                        if(party.roles) {
                            for(let role of party.roles) {
                                roles.set(role.id, role);
                            }
                        }
                    }
                    return { ...state, parties, roles };
                }
                case GatewayMessageDiscriminator.Event: {
                    let p = action.payload.p;
                    switch(p.o) {
                        case GatewayEventCode.PartyCreate:
                        case GatewayEventCode.PartyUpdate: {
                            let party = p.p;

                            return produce(state, draft => {
                                let existing = draft.parties.get(party.id);

                                // PartyPositionUpdate only
                                if(!party.name && existing) {
                                    existing.party.position = party.position;
                                    return;
                                }

                                if(existing) {
                                    existing.party = party as Party;
                                } else {
                                    // create party
                                    draft.parties.set(party.id, {
                                        party: party as Party,
                                        rooms: [],
                                        members: new Map(),
                                        needs_refresh: true,
                                        member_colors: new Map(),
                                        role_members: new Map(),
                                    });

                                    if(party.roles) {
                                        for(let role of party.roles) {
                                            draft.roles.set(role.id, role);
                                        }
                                    }
                                }
                            });
                        }
                        case GatewayEventCode.PartyDelete: {
                            let party_id = p.p.id;

                            return produce(state, draft => {
                                draft.parties.delete(party_id);

                                let removed_roles = [];
                                for(let role of draft.roles.values()) {
                                    if(role.party_id == party_id) {
                                        removed_roles.push(role.id);
                                    }
                                }
                                for(let role_id of removed_roles) {
                                    draft.roles.delete(role_id);
                                }
                            });
                        }
                        case GatewayEventCode.PresenceUpdate: {
                            let { user, party: party_id, presence } = p.p;
                            if(!party_id) break;

                            return produce(state, draft => {
                                let party = draft.parties.get(party_id!);
                                if(!party) return;

                                let member = party.members.get(user.id);
                                if(!member) return;

                                member.presence = presence;
                            });
                        }
                        case GatewayEventCode.RoleDelete:
                        case GatewayEventCode.RoleUpdate:
                        case GatewayEventCode.RoleCreate: {
                            let role = p.p;

                            return produce(state, draft => {
                                let party = draft.parties.get(role.party_id);
                                if(!party) return;

                                let party_model = party.party,
                                    roles = draft.roles,
                                    existing = roles.get(role.id),
                                    members = party.role_members.get(role.id);

                                // Ensure state.roles, role_members and party.roles are all updated accordingly
                                switch(p.o) {
                                    case GatewayEventCode.RoleCreate:
                                    case GatewayEventCode.RoleUpdate: {
                                        draft.roles.set(role.id, role as Role);

                                        party_model.roles ??= [];
                                        if(p.o != GatewayEventCode.RoleCreate) {
                                            // attempt to find an existing role entry, update it, and break early
                                            let idx = party_model.roles.findIndex(r => r.id == role.id);
                                            if(idx != -1) { party_model.roles[idx] = role as Role; break; }
                                        }

                                        // if not found or created, push
                                        party_model.roles.push(role as Role);
                                        break;
                                    }
                                    case GatewayEventCode.RoleDelete: {
                                        roles.delete(role.id);
                                        party.role_members.delete(role.id);
                                        party_model.roles = party_model.roles?.filter(r => r.id == role.id);
                                    }
                                }

                                // early bail
                                if(!existing || !members) return;

                                // basically the same logic as MembersLoaded, but clears the existing color first
                                for(let member_id of members.values()) {
                                    // clear color before recomputing
                                    party.member_colors.delete(member_id);

                                    let member = party.members.get(member_id);
                                    if(!member) continue;

                                    let member_roles = member.roles;
                                    if(!member_roles || !member_roles.length) continue;

                                    let highest_role = roles.get(member_roles[0]);
                                    if(!highest_role) continue;

                                    for(let role_id of member_roles.slice(1)) {
                                        let new_role = roles.get(role_id);
                                        if(!new_role || new_role.color == null) continue;

                                        if(new_role.position < highest_role.position || highest_role.color == null) {
                                            highest_role = new_role;
                                        }
                                    }

                                    if(highest_role.color != null) {
                                        party.member_colors.set(member.user.id, computeRoleColor(highest_role)!);
                                    }
                                }
                            });
                        }
                        case GatewayEventCode.MemberUpdate:
                        case GatewayEventCode.MemberAdd: {
                            let member = p.p,
                                { party_id, user } = member, id = user.id;

                            return produce(state, draft => {
                                let party = draft.parties.get(party_id), roles = draft.roles;
                                if(!party) return;

                                let existing: Partial<PartyMember> = party.members.get(id) || {},
                                    old_roles = existing.roles;

                                party.members.set(id, { ...existing, ...member });

                                // handle updating roles
                                {
                                    let set_roles = true;

                                    // clear old roles if changed
                                    if(old_roles) {
                                        if(shallowEqualArrays(old_roles, member.roles)) {
                                            set_roles = false;
                                        } else {
                                            for(let role_id of old_roles) {
                                                let role_members = party.role_members.get(role_id);
                                                if(!role_members) continue;

                                                role_members.delete(id);
                                            }
                                        }
                                    }

                                    if(set_roles && member.roles) {
                                        for(let role_id of member.roles) {
                                            let role_members = party.role_members.get(role_id);
                                            if(!role_members) {
                                                role_members = new Set();
                                                party.role_members.set(role_id, role_members);
                                            }
                                            role_members.add(id);
                                        }
                                    }
                                }

                                // handle role colors
                                {
                                    // clear color before updating
                                    party.member_colors.delete(id);

                                    // all below is the same logic as in MEMBERS_LOADED
                                    let member_roles = member.roles;
                                    if(!member_roles || !member_roles.length) return;

                                    let highest_role = roles.get(member_roles[0]);
                                    if(!highest_role) return;

                                    for(let role_id of member_roles.slice(1)) {
                                        let new_role = roles.get(role_id);
                                        if(!new_role || new_role.color == null) continue;

                                        if(new_role.position < highest_role.position || highest_role.color == null) {
                                            highest_role = new_role;
                                        }
                                    }

                                    if(highest_role.color != null) {
                                        party.member_colors.set(id, computeRoleColor(highest_role)!);
                                    }
                                }
                            });
                        }
                        case GatewayEventCode.MemberRemove: {
                            let member = p.p, { party_id, user } = member;

                            return produce(state, draft => {
                                let party = draft.parties.get(party_id);
                                if(!party) return;

                                party.members.delete(user.id);
                            });
                        }
                        case GatewayEventCode.UserUpdate: {
                            let user = p.p.user;

                            return produce(state, draft => {
                                // TODO: Maybe more intelligent lookups by providing a party_id on the server?
                                for(let party of draft.parties.values()) {
                                    let member = party.members.get(user.id);
                                    if(!member) continue;

                                    member.user = user;
                                }
                            });
                        }
                        default: break;
                    }

                    break;
                }
            }
            break;
        }

    }

    return state;
}