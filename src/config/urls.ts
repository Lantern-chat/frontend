import { SUPPORTS_AVIF, SUPPORTS_WEBM } from "lib/codecs";
import { minimize } from "lib/emoji_lite";
//import { usePrefs } from "state/contexts/prefs";
import { Snowflake, AssetFlags, asset_flags } from "state/models";

const PROTOCOL = window.config.secure ? 'https://' : (window.location.protocol + '//');

const CDN_URL =
    (__DEV__ && window.config.cdn == window.location.hostname) ?
        `${PROTOCOL}${window.location.host}/cdn` :
        `${PROTOCOL}${window.config.cdn}`;

const DEFAULT_FORMATS = AssetFlags.FORMAT_PNG | AssetFlags.FORMAT_JPEG | AssetFlags.FORMAT_GIF;

function gen_formats(lbm: boolean): AssetFlags {
    return DEFAULT_FORMATS | (SUPPORTS_AVIF() ? AssetFlags.FORMAT_AVIF : 0) | (SUPPORTS_WEBM() ? AssetFlags.FORMAT_WEBM : 0);
}

export function asset_url(category: 'user' | 'party' | 'room' | 'role' | 'emote', id: Snowflake, hash: string, asset_kind: 'avatar' | 'banner', lbm: boolean): string {
    return `${CDN_URL}/${category}/${id}/${asset_kind}${hash && '/'}${hash}?f=` + asset_flags(lbm ? 0 : 90, gen_formats(lbm), true, true);
}

export function emote_url(category: 'emote' | 'sticker', id: Snowflake, lbm: boolean): string {
    return `${CDN_URL}/${category}/${id}?f=` + asset_flags(lbm ? 0 : 90, gen_formats(lbm), true, true);
}

export function message_attachment_url(room_id: Snowflake, attachment_id: Snowflake, filename: string): string {
    return `${CDN_URL}/attachments/${room_id}/${attachment_id}/${filename}`
}

export function room_url(party_id: Snowflake, room_id?: Snowflake): string {
    let url = `/channels/${party_id}/`;
    return room_id ? (url + room_id) : url;
}

export const emoji_url = (emoji: string): string => `/static/emoji/individual/${minimize(emoji)}.svg`;