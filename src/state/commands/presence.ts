import { IS_MOBILE } from "lib/user_agent";
import { DispatchableAction } from "state/actions";
import { GLOBAL } from "state/global";
import { GatewayCommandDiscriminator } from "worker/gateway/cmd";

export function setPresence(away: boolean): DispatchableAction {
    return (dispatch, getState) => {
        let state = getState(),
            presence = state.user.presence;

        if(presence && (presence.flags & 3) == (away ? 2 : 1)) return;

        GLOBAL.gateway!.postCmd({ t: GatewayCommandDiscriminator.SetPresence, away, mobile: IS_MOBILE });
    };
}