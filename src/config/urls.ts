import { CDN_URL, BASE_URL } from "config/base";

import { Snowflake } from "state/models";

export function user_avatar_url(user_id: Snowflake, avatar_key: string): string {
    return `${CDN_URL}/avatar/${user_id}/${avatar_key}`;
}

export function message_attachment_url(room_id: Snowflake, attachment_id: Snowflake, filename: string): string {
    return `${CDN_URL}/attachments/${room_id}/${attachment_id}/${filename}`
}

export function room_url(party_id: Snowflake, room_id?: Snowflake): string {
    let url = `${BASE_URL}/channels/${party_id}/`;
    return room_id ? (url + room_id) : url;
}