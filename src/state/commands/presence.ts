import { UserPresenceFlags } from "state/models";
import { IS_MOBILE } from "lib/user_agent";
import { DispatchableAction } from "state/actions";
import { GLOBAL } from "state/global";
import { GatewayStatus } from "state/mutators/gateway";
import { GatewayCommandDiscriminator } from "worker/gateway/cmd";

const ONLINE_OR_AWAY = UserPresenceFlags.Away | UserPresenceFlags.Online;

export function setPresence(away: boolean): DispatchableAction {
    return (dispatch, state) => {
        let presence = state.user.presence;

        if(state.gateway.status != GatewayStatus.Connected) return;
        if(presence && (presence.flags & ONLINE_OR_AWAY) == (away ? UserPresenceFlags.Away : UserPresenceFlags.Online)) return;

        GLOBAL.gateway!.postCmd({ t: GatewayCommandDiscriminator.SetPresence, away, mobile: IS_MOBILE });
    };
}