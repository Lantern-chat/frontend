/**
 * Plan:
 *
 * When using virtualized infinite lists for the chat, videos may unload while playing.
 *
 * However, if we make it so that components in the chat have a time to "clean up" (as a generic phase) before being unloaded,
 * then it would give us time to do the following:
 *
 * 1. Video attachment gets the signal that unloading is about to start
 * 2. A new modal is created behind the chat, and the video element is added with the currently playing file
 * 3. The file is paused, but is given the timestamp via #t=100 or whatever from when the unload signal was fired
 * 4. When we receive the `canplay` event from the pip video, get the exact current time of the attachment video
 *      then resync the pip video and begin playing it.
 * 5. Stop the attachment video either instantly or on the next frame via requestAnimationFrame
 * 6. Allow attachment unloading to continue.
 *
 *  */