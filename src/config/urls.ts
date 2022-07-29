import { SUPPORTS_AVIF, SUPPORTS_WEBM } from "lib/codecs";
import { usePrefs } from "state/contexts/prefs";
import { Snowflake, AssetFlags, asset_flags } from "state/models";

const PROTOCOL = window.config.secure ? 'https://' : (window.location.protocol + '//');

const CDN_URL =
    (__DEV__ && window.config.cdn == window.location.hostname) ?
        `${PROTOCOL}${window.location.host}/cdn` :
        `${PROTOCOL}${window.config.cdn}`;

const DEFAULT_FORMATS = AssetFlags.FORMAT_PNG | AssetFlags.FORMAT_JPEG | AssetFlags.FORMAT_GIF;

export function asset_url(category: string, id: Snowflake, hash: string, asset_kind: 'avatar' | 'banner' = 'avatar'): string {
    let formats = DEFAULT_FORMATS | (SUPPORTS_AVIF() ? AssetFlags.FORMAT_AVIF : 0) | (SUPPORTS_WEBM() ? AssetFlags.FORMAT_WEBM : 0);

    return `${CDN_URL}/${category}/${id}/${asset_kind}/${hash}?f=` + asset_flags(usePrefs().LowBandwidthMode() ? 0 : 90, formats, true, true);
}

export function user_avatar_url(user_id: Snowflake, avatar_hash: string): string {
    return asset_url('user', user_id, avatar_hash);
}

export function party_avatar_url(party_id: Snowflake, avatar_hash: string): string {
    return asset_url('party', party_id, avatar_hash);
}

export function room_avatar_url(room_id: Snowflake, avatar_hash: string): string {
    return asset_url('room', room_id, avatar_hash);
}

export function role_avatar_url(role_id: Snowflake, avatar_hash: string): string {
    return asset_url('role', role_id, avatar_hash);
}

export function message_attachment_url(room_id: Snowflake, attachment_id: Snowflake, filename: string): string {
    return `${CDN_URL}/attachments/${room_id}/${attachment_id}/${filename}`
}

export function room_url(party_id: Snowflake, room_id?: Snowflake): string {
    let url = `/channels/${party_id}/`;
    return room_id ? (url + room_id) : url;
}
