import { CDN_URL } from "config/base";

import { Snowflake } from "state/models";

export function user_avatar_url(user_id: Snowflake, avatar_key: string): string {
    return `${CDN_URL}/avatar/${user_id}/${avatar_key}`;
}

export function message_attachment_url(room_id: Snowflake, attachment_id: Snowflake, filename: string): string {
    return `${CDN_URL}/attachments/${room_id}/${attachment_id}/${filename}`
}