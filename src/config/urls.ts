import { Snowflake } from "state/models";

const cdn_url = () => `https://${window.config.cdn}`;

function avatar_url(category: string, id: Snowflake, hash: string): string {
    return `${cdn_url()}/avatar/${category}/${id}/${hash}`;
}

export function user_avatar_url(user_id: Snowflake, avatar_hash: string): string {
    return avatar_url('user', user_id, avatar_hash);
}

export function party_avatar_url(party_id: Snowflake, avatar_hash: string): string {
    return avatar_url('party', party_id, avatar_hash);
}

export function room_avatar_url(room_id: Snowflake, avatar_hash: string): string {
    return avatar_url('room', room_id, avatar_hash);
}

export function role_avatar_url(role_id: Snowflake, avatar_hash: string): string {
    return avatar_url('role', role_id, avatar_hash);
}

export function message_attachment_url(room_id: Snowflake, attachment_id: Snowflake, filename: string): string {
    return `${cdn_url()}/attachments/${room_id}/${attachment_id}/${filename}`
}

export function room_url(party_id: Snowflake, room_id?: Snowflake): string {
    let url = `/channels/${party_id}/`;
    return room_id ? (url + room_id) : url;
}