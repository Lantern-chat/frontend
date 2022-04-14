import { formatRgbBinary } from "lib/color";
import { Role, Snowflake, User } from "state/models";
import { ReadRootState } from "state/root";

var COLOR_CACHE: Map<number, string> = new Map();

export function computeRoleColor(role: Role): string | undefined {
    let color = role.color;
    if(typeof color !== 'number') return;

    let cached = COLOR_CACHE.get(color);
    if(!cached) {
        COLOR_CACHE.set(color, cached = formatRgbBinary(color));
    }

    return cached;
}

export function selectRoleColor(role_id: Snowflake): (state: ReadRootState) => (string | undefined) {
    return (state: ReadRootState) => {
        let role = state.party.roles[role_id];
        if(!role) return;

        return computeRoleColor(role);
    }
}

//export function selectUserColor(party_id: Snowflake, user: User): (state: ReadRootState) => (string | undefined) {
//
//}