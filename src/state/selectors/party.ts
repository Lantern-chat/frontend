import { formatRgbBinary } from "lib/color";
import { Role, Snowflake, User } from "state/models";
import { RootState } from "state/root";

var COLOR_CACHE: Map<number, string> = new Map();

export function computeRoleColor(role: Role): string | undefined {
    let color = role.color;
    if(typeof color !== "number") return;

    let cached = COLOR_CACHE.get(color);
    if(!cached) {
        COLOR_CACHE.set(color, cached = formatRgbBinary(color));
    }

    return cached;
}

export function selectRoleColor(role_id: Snowflake): (state: RootState) => (string | undefined) {
    return (state: RootState) => {
        let role = state.party.roles[role_id];
        if(!role) return;

        return computeRoleColor(role);
    }
}

//export function selectUserColor(party_id: Snowflake, user: User): (state: RootState) => (string | undefined) {
//
//}