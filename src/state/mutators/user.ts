import { Action, Type } from "../actions";

import { ServerMsgOpcode, User, UserPresence, UserPresenceFlags } from "../models";
import { ISession } from "lib/session";
import { erase } from "lib/util";
import { GatewayMessageDiscriminator } from "worker/gateway/msg";
import { mutatorWithDefault } from "solid-mutant";

export interface IUserState {
    user?: User,
    session?: ISession | null,
    friends?: User[],
    presence?: UserPresence,
    quota_used?: number,
    quota_total?: number,
}

export const userMutator = mutatorWithDefault(
    () => ({}),
    (state: IUserState, action: Action) => {
        switch(action.type) {
            case Type.SESSION_LOGIN: {
                state.session = action.session;
                break;
            }
            case Type.SESSION_EXPIRED: {
                erase(state); // clear entire user state
                break;
            }
            case Type.UPDATE_QUOTA: {
                state.quota_total = action.quota_total;
                state.quota_used = action.quota_used;
                break;
            }
            case Type.GATEWAY_EVENT: {
                let ev = action.payload;

                switch(ev.t) {
                    case GatewayMessageDiscriminator.Ready: {
                        // Initialize the user with `online` presence to start with
                        // TODO: Improve this

                        state.user = ev.p.user;
                        state.presence = { flags: UserPresenceFlags.Online };
                        break;
                    }
                    case GatewayMessageDiscriminator.Event: {
                        if(!state.user) break;

                        let p = ev.p;
                        switch(p.o) {
                            case ServerMsgOpcode.PresenceUpdate: {
                                if(p.p.user.id == state.user.id) {
                                    state.presence = p.p.presence;
                                }
                                break;
                            }
                            case ServerMsgOpcode.UserUpdate: {
                                let user = p.p.user;

                                // overwrite own user info if same user and has private fields present
                                // indicating it's meant for us
                                if(user.id == state.user!.id && user.email) {
                                    Object.assign(state.user, user);
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
);