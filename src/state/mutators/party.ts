import { GatewayMessageDiscriminator } from "worker/gateway/msg";
import { PartyMember, Role } from "state/models";
import { Action, Type } from "../actions";

import { Snowflake, Party, Room, ServerMsgOpcode } from "../models";
import { computeRoleColor } from "state/selectors/party";
import { shallowEqualArrays } from "lib/compare";
import { mutatorWithDefault } from "solid-mutant";
import { erase } from "lib/util";
import { ArraySet, ObjectMap } from "state/util/map_set";


export interface IParty {
    party: Party,
    rooms: Room[],
    members: Record<Snowflake, PartyMember>,

    /// Cached colors for users
    ///
    /// TODO: Maybe store a reference to an object containing the string,
    /// instead of the string itself? Depends on how string refs work.
    member_colors: Record<Snowflake, string>,

    /// Reverse lookup mapping role_id -> Set of user_ids
    ///
    /// Useful for finding which user's colors should be updated when a role updates
    role_members: Record<Snowflake, Array<Snowflake>>,

    /// If true, party will be refetched on activation
    needs_refresh: boolean,
}

export interface IPartyState {
    parties: Record<Snowflake, IParty>,
    roles: Record<Snowflake, Role>,
    last_channel: Record<Snowflake, Snowflake>,
    active_party?: Snowflake,
    //sorted: Snowflake[]
}

export const partyMutator = mutatorWithDefault(
    () => ({
        parties: {},
        roles: {},
        last_channel: {},
    }),
    (state: IPartyState, action: Action) => {
        switch(action.type) {
            case Type.SESSION_EXPIRED: {
                state.parties = {};
                state.roles = {};
                state.last_channel = {};
                break;
            }
            case Type.PARTY_LOADED: {
                let { party_id, rooms } = action,
                    party = state.parties[party_id];

                if(party) {
                    rooms.sort((a, b) => a.position - b.position);
                    for(let room of rooms) {
                        if(__DEV__ && room.party_id !== party_id) {
                            alert("Mismatch in fetched rooms!");
                        }
                        party.rooms.push(room);
                    }
                    party.needs_refresh = false;
                }

                break;
            }
            case Type.HISTORY_UPDATE: {
                let [, party_id, channel_id] = action.ctx.parts,
                    party = state.parties[party_id];
                if(party) {
                    // if the new room exists, set last_channel
                    let room = party.rooms.find(room => room.id == channel_id);
                    if(room) { state.last_channel[party_id] = channel_id; }
                }
                break;
            }
            case Type.MEMBERS_LOADED: {
                let party = state.parties[action.party_id], roles = state.roles;
                if(!party) return;

                for(let member of action.members) {
                    let user = member.user;

                    // set the member structure easily enough
                    party.members[user.id] = member;

                    // if the member has any roles, process those
                    let member_roles = member.roles;
                    if(!member_roles || !member_roles.length) continue;

                    for(let role_id of member_roles) {
                        let role_members = party.role_members[role_id];
                        if(!role_members) {
                            party.role_members[role_id] = role_members = [];
                        }

                        // ensure ordered insertion
                        ArraySet(role_members).add(user.id);
                    }

                    // start with the highest role, double-checking it exists
                    let highest_role = roles[member_roles[0]];
                    if(!highest_role) continue;

                    // iterate over user roles
                    for(let role_id of member_roles.slice(1)) {
                        let new_role = roles[role_id];
                        if(!new_role || new_role.color == null) continue;

                        // find the role with the "highest" (lowest position), or if the
                        // initial highest role had no color pick the first matching
                        if(new_role.position < highest_role.position || highest_role.color == null) {
                            highest_role = new_role;
                        }
                    }

                    // if a color was found, cache it
                    if(highest_role.color != null) {
                        party.member_colors[user.id] = computeRoleColor(highest_role)!;
                    }
                }

                break;
            }
            case Type.GATEWAY_EVENT: {
                let event = action.payload;
                switch(event.t) {
                    case GatewayMessageDiscriminator.Ready: {
                        let p = event.p;

                        let roles = {}, parties = {};

                        for(let party of p.parties) {
                            parties[party.id] = {
                                party,
                                rooms: [],
                                members: {},
                                needs_refresh: true,
                                member_colors: {},
                                role_members: {},
                            };

                            if(party.roles) {
                                for(let role of party.roles) {
                                    roles[role.id] = role;
                                }
                            }
                        }

                        state.parties = parties;
                        state.roles = roles;

                        break;
                    }
                    case GatewayMessageDiscriminator.Event: {
                        let p = event.p;
                        switch(p.o) {
                            case ServerMsgOpcode.PartyCreate:
                            case ServerMsgOpcode.PartyUpdate: {
                                let party = p.p, existing = state.parties[party.id];

                                // PartyPositionUpdate only
                                if(!party.name) {
                                    if(existing) {
                                        existing.party.position = party.position;
                                    }
                                    return;
                                }

                                if(existing) {
                                    existing.party = party as Party;
                                } else {
                                    // create party
                                    state.parties[party.id] = {
                                        party: party as Party,
                                        rooms: [],
                                        members: {},
                                        needs_refresh: true,
                                        member_colors: {},
                                        role_members: {},
                                    };

                                    if(party.roles) {
                                        for(let role of party.roles) {
                                            state.roles[role.id] = role;
                                        }
                                    }
                                }

                                break;
                            }
                            case ServerMsgOpcode.PartyDelete: {
                                let party_id = p.p.id;

                                let removed_roles = [];
                                for(let role_id in state.roles) {
                                    if(state.roles[role_id].party_id == party_id) {
                                        removed_roles.push(role_id);
                                    }
                                }
                                for(let role_id of removed_roles) {
                                    delete state.roles[role_id];
                                }

                                delete state.parties[party_id];

                                break;
                            }
                            case ServerMsgOpcode.PresenceUpdate: {
                                let { user, party: party_id, presence } = p.p;
                                if(party_id) {
                                    let party = state.parties[party_id!];
                                    if(party) {
                                        let member = party.members[user.id];
                                        if(member) {
                                            member.presence = presence;
                                        }
                                    }
                                }
                                break;
                            }
                            case ServerMsgOpcode.RoleDelete:
                            case ServerMsgOpcode.RoleUpdate:
                            case ServerMsgOpcode.RoleCreate: {
                                let role = p.p, party = state.parties[role.party_id];
                                if(!party) return;

                                let party_model = party.party,
                                    roles = state.roles,
                                    existing = roles[role.id],
                                    members = party.role_members[role.id];

                                // Ensure state.roles, role_members and party.roles are all updated accordingly
                                switch(p.o) {
                                    case ServerMsgOpcode.RoleCreate:
                                    case ServerMsgOpcode.RoleUpdate: {
                                        roles[role.id] = role as Role;

                                        party_model.roles ??= [];
                                        if(p.o != ServerMsgOpcode.RoleCreate) {
                                            // attempt to find an existing role entry, update it, and break early
                                            let idx = party_model.roles.findIndex(r => r.id == role.id);
                                            if(idx != -1) { party_model.roles[idx] = role as Role; break; }
                                        }

                                        // if not found or created, push
                                        party_model.roles.push(role as Role);
                                        break;
                                    }
                                    case ServerMsgOpcode.RoleDelete: {
                                        delete roles[role.id];
                                        delete party.role_members[role.id];
                                        party_model.roles = party_model.roles.filter(r => r.id == role.id);
                                    }
                                }

                                // early bail
                                if(!existing || !members) return;

                                // basically the same logic as MembersLoaded, but clears the existing color first
                                for(let member_id of members.values()) {
                                    // clear color before recomputing
                                    delete party.member_colors[member_id];
                                    let member = party.members[member_id];

                                    if(member) {
                                        let member_roles = member.roles;
                                        if(!member_roles || !member_roles.length) continue;

                                        let highest_role = roles[member_roles[0]];
                                        if(highest_role) {
                                            for(let role_id of member_roles.slice(1)) {
                                                let new_role = roles[role_id];
                                                if(!new_role || new_role.color == null) continue;

                                                if(new_role.position < highest_role.position || highest_role.color == null) {
                                                    highest_role = new_role;
                                                }
                                            }

                                            if(highest_role.color != null) {
                                                party.member_colors[member.user.id] = computeRoleColor(highest_role)!;
                                            }
                                        }
                                    }
                                }
                                break;
                            }
                            case ServerMsgOpcode.MemberUpdate:
                            case ServerMsgOpcode.MemberAdd: {
                                let member = p.p,
                                    { party_id, user } = member, id = user.id,
                                    party = state.parties[party_id], roles = state.roles;

                                if(!party) return;

                                let existing: Partial<PartyMember> = party.members[id],
                                    old_roles = existing?.roles;

                                if(!existing) {
                                    party.members[id] = member;
                                } else {
                                    Object.assign(party.members[id], member);
                                }

                                // handle updating roles
                                {
                                    let set_roles = true;

                                    // clear old roles if changed
                                    if(old_roles) {
                                        if(shallowEqualArrays(old_roles, member.roles)) {
                                            set_roles = false;
                                        } else {
                                            for(let role_id of old_roles) {
                                                let role_members = party.role_members[role_id];
                                                if(role_members) {
                                                    ArraySet(role_members).delete(id);
                                                }
                                            }
                                        }
                                    }

                                    if(set_roles && member.roles) {
                                        for(let role_id of member.roles) {
                                            let role_members = party.role_members[role_id];
                                            if(!role_members) { party.role_members[role_id] = role_members = []; }
                                            ArraySet(role_members).add(id);
                                        }
                                    }
                                }

                                // handle role colors
                                {
                                    // clear color before updating
                                    delete party.member_colors[id];

                                    // all below is the same logic as in MEMBERS_LOADED
                                    let member_roles = member.roles;
                                    if(!member_roles || !member_roles.length) return;

                                    let highest_role = roles[member_roles[0]];
                                    if(!highest_role) return;

                                    for(let role_id of member_roles.slice(1)) {
                                        let new_role = roles[role_id];
                                        if(!new_role || new_role.color == null) continue;

                                        if(new_role.position < highest_role.position || highest_role.color == null) {
                                            highest_role = new_role;
                                        }
                                    }

                                    if(highest_role.color != null) {
                                        party.member_colors[id] = computeRoleColor(highest_role)!;
                                    }
                                }

                                break;
                            }
                            case ServerMsgOpcode.MemberRemove: {
                                let member = p.p, { party_id, user } = member,
                                    party = state.parties[party_id];
                                if(party) { delete party.members[user.id]; }

                                break;
                            }
                            case ServerMsgOpcode.UserUpdate: {
                                let user = p.p.user;

                                // TODO: Maybe more intelligent lookups by providing a party_id on the server?
                                for(let party_id in state.parties) {
                                    let party = state.parties[party_id],
                                        member = party.members[user.id];

                                    if(member) {
                                        member.user = user;
                                    }
                                }
                                break;
                            }
                        }

                        break;
                    }
                }

                break;
            }
        }
    }
)