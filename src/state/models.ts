export enum ErrorKind {
    Unknown,
    ServerError,
    ClientError,
}

export interface ApiError {
    code: number,
    message: string,
}

export enum ErrorCode {
    AlreadyExists = 40001,
    UsernameUnavailable = 40002,
    InvalidEmail = 40003,
    InvalidUsername = 40004,
    InvalidPassword = 40005,
    InvalidCredentials = 40006,
    InsufficientAge = 40007,
    InvalidDate = 40008,
    InvalidContent = 40009,
    InvalidName = 40010,
    InvalidTopic = 40011,
    MissingUploadMetadataHeader = 40012,
    MissingAuthorizationHeader = 40013,
    NoSession = 40014,
    InvalidAuthFormat = 40015,
    HeaderParseError = 40016,
    MissingFilename = 40017,
    MissingMime = 40018,
    AuthTokenParseError = 40019,
    DecodeError = 40020,
    BodyDeserializeError = 40021,
    QueryParseError = 40022,
    UploadError = 40023,
    InvalidPreview = 40024,
    MimeParseError = 40025,
    InvalidImageFormat = 40026,
    TOTPRequired = 40027,
    InvalidPreferences = 40028,
    TemporarilyDisabled = 40029,
    InvalidCaptcha = 40030,
}

export function errorKind(err: ApiError): ErrorKind {
    if(err.code >= 60000) {
        return ErrorKind.Unknown;
    } else if(err.code >= 50000) {
        return ErrorKind.ServerError;
    } else if(err.code >= 40000) {
        return ErrorKind.ClientError;
    } else {
        return ErrorKind.Unknown;
    }
}

export function parseApiError(err: ApiError): ErrorCode | undefined {
    return ErrorCode[ErrorCode[err.code]];
}

export function errorCodeToi18n(err: ApiError): string {
    return ""; // TODO
}

export enum Intent {
    PARTIES = 1 << 0,
    PARTY_MEMBERS = 1 << 1,
    PARTY_BANS = 1 << 2,
    PARTY_EMOTES = 1 << 3,
    PARTY_INTEGRATIONS = 1 << 4,
    PARTY_WEBHOOKS = 1 << 5,
    PARTY_INVITES = 1 << 6,
    VOICE_STATUS = 1 << 7,
    PRESENCE = 1 << 8,
    MESSAGES = 1 << 9,
    MESSAGE_REACTIONS = 1 << 10,
    MESSAGE_TYPING = 1 << 11,
    DIRECT_MESSAGES = 1 << 12,
    DIRECT_MESSAGE_REACTIONS = 1 << 13,
    DIRECT_MESSAGE_TYPING = 1 << 14,

    ALL_DESKTOP = (1 << 15) - 1, // all 1s

    ALL_MOBILE = Intent.ALL_DESKTOP & ~Intent.PRESENCE, // TODO: Add more
}

export type Snowflake = string;

export interface User {
    id: Snowflake,
    username: string,
    discriminator: number,
    flags: number,
    avatar?: string,
    status?: string,
    bio?: string,
    email?: string,
    preferences?: Partial<UserPreferences>,
}

export interface AnonymousSession {
    expires: string,
}

export interface Session extends AnonymousSession {
    auth: string,
}

export enum Font {
    SansSerif = 0,
    Serif,
    Monospace,
    Cursive,
    ComicSans,

    OpenDyslexic = 30,
}

export const FONT_NAMES: { [key in keyof typeof Font]: string } = {
    "SansSerif": "Sans Serif",
    "Serif": "Serif",
    "Monospace": "Monospace",
    "Cursive": "Cursive",
    "ComicSans": "Comis Sans",
    "OpenDyslexic": "Open Dyslexic",
}

export enum UserPreferenceFlags {
    ReduceAnimations = 1 << 0,
    UnfocusPause = 1 << 1,
    LightMode = 1 << 2,
    AllowDms = 1 << 3,
    GroupLines = 1 << 4,
    HideAvatars = 1 << 5,
    OledMode = 1 << 6,
    MuteMedia = 1 << 7,
    HideUnknown = 1 << 8,
    CompactView = 1 << 9,
    UsePlatformEmojis = 1 << 10,
    EnableSpellcheck = 1 << 11,

    DeveloperMode = 1 << 15,
}

export interface UserPreferences {
    locale: number,
    friend_add: number,
    flags: number,
    temp: number,
    chat_font: Font,
    ui_font: Font,
    chat_font_size: number,
    ui_font_size: number,
    tab_size: number,
    time_format: string,
    pad: number,
}

export function hasUserPrefFlag(prefs: Pick<UserPreferences, 'flags'>, flag: UserPreferenceFlags): boolean {
    return (prefs.flags & flag) !== 0;
}

export interface UserPresence {
    flags: number,
    updated_at?: string,
    activity?: Activity,
}

export interface Activity { }

export interface Friend {
    note?: string,
    flags: number,
    user: User,
}

export interface Room {
    id: Snowflake,
    party_id?: Snowflake,
    avatar?: string,
    name: string,
    topic?: string,
    position: number,
    flags: number,
    rate_limit_per_user?: number,
    parent_id?: Snowflake,
    overwrites?: Overwrite[],
}

export interface Message {
    id: Snowflake,
    room_id: Snowflake,
    party_id?: Snowflake,
    author: User,
    member?: PartialPartyMember,
    thread_id?: Snowflake,
    created_at: string,
    edited_at?: string,
    content: string,
    flags: number,
    user_mentions?: Snowflake[],
    role_mentions?: Snowflake[],
    room_mentions?: Snowflake[],
    reactions?: Reaction[],
    attachments?: Attachment[],
    embeds?: Embed[],
}

export type Reaction = ReactionShorthand | ReactionFull;

export interface ReactionShorthand {
    emote: Snowflake,
    own: boolean,
    count: number,
}

export interface ReactionFull {
    emote: Emote,
    users: Snowflake[],
}

export interface EmbedMediaAttributes {
    title?: string,
    description?: string,
    url?: string,
    ts?: string,
    color?: number,
}

export enum EmbedMediaKind {
    Image = "image",
    Video = "video",
    Audio = "audio",
    Thumbnail = "thumbnail",
}

export interface EmbedMedia extends EmbedMediaAttributes {
    type: EmbedMediaKind,
}

export interface Embed {
    // TODO
}

export interface File {
    id: Snowflake,
    filename: string,
    size: number,
    mime?: string,
    width?: number,
    height?: number,
    preview?: string,
}

export interface Attachment extends File { }

export interface PartialParty {
    id: Snowflake,
    name: string,
    description?: string,
}

export interface Party extends PartialParty {
    owner: Snowflake,
    security: number,
    roles?: Role[],
    emotes?: Emote[],
    avatar?: string,
    position: number,
}

export interface PartyMember {
    user: User,
    nick: string | null,
    roles?: Snowflake[],
    presence?: UserPresence,
}

export type PartialPartyMember = PartialBy<PartyMember, 'user'>;

export interface Invite {
    code: string,
    party: PartialParty,
    inviter: Snowflake,
    description: string,
}

export interface Permission {
    party: number,
    room: number,
    stream: number,
}

export interface Overwrite {
    id: Snowflake,
    allow?: Permission,
    deny?: Permission,
}

export interface Role {
    id: Snowflake,
    party_id: Snowflake,
    icon?: string,
    name: string,
    permissions: Permission,
    color: number | null,
    position: number,
    flags: number,
}

export interface CustomEmote {
    id: Snowflake,
    party_id: Snowflake,
    file: Snowflake,
    name: string,
    flags: number,
    aspect_ratio: number,
}

export interface StandardEmote {
    name: string,
}

export type Emote = StandardEmote | CustomEmote;


// GATEWAY

export type GatewayEvent =
    HelloEvent |
    ReadyEvent |
    TypingStartEvent |
    UserPresenceUpdateEvent |
    UserUpdateEvent |
    MessageDeleteEvent;

export interface HelloEvent {
    heartbeat_interval: number,
}

export interface ReadyEvent {
    user: User,
    dms: Room[],
    parties: Party[],
    session: Snowflake,
}

export interface TypingStartEvent {
    room: Snowflake,
    party?: Snowflake,
    user: Snowflake,
    member?: PartyMember,
}

export interface UserPresenceUpdateEvent {
    user: User,
    party?: Snowflake,
    presence: UserPresence,
}

export interface UserUpdateEvent {
    user: User,
}

export interface MessageDeleteEvent {
    id: Snowflake,
    room_id: Snowflake,
    party_id?: Snowflake,
}

export interface MemberEvent extends PartyMember {
    party_id: Snowflake,
}

export enum PresenceStatus {
    Online,
    Away,
    Busy,
    Offline,
}

export function parse_presence(p?: UserPresence): { status: PresenceStatus, is_mobile: boolean } {
    let status = PresenceStatus.Offline, is_mobile = false;

    if(p) {
        if((p.flags & 1) == 1) status = PresenceStatus.Online;
        else if((p.flags & 2) == 2) status = PresenceStatus.Away;
        else if((p.flags & 4) == 4) status = PresenceStatus.Busy;
        is_mobile = (p.flags & 8) == 8;
    }

    return { status, is_mobile };
}