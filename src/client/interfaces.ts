export interface UserInfo {
    username: string,
    displayname?: string,
}

export interface UserPreferences {
    /**
     * Unloads channels on navigation, disrupting media and
     * requiring a reload on navigation back. Otherwise,
     * channels will remain loaded so media can remain active,
     * including images and videos.
     */
    unloadChannelOnNavigate: boolean,
    /**
     * Maximum number of messages to render to the DOM at a time.
     *
     * Lantern will attempt to clear old messages until the count is under this limit.
     */
    maxRenderedMessages: number,
    /**
     * Lanern messages are loaded in chunks? TODO: Decide on this.
     */
    messageChunkSize: number,
}