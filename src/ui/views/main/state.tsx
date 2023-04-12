import { ReactiveEventEmitter } from "lib/event_emitter";
import { createContext } from "solid-js";

export enum FeedCommandDiscriminator {
    ScrollToBottom,
}

export interface FeedScrollToBottom {
    t: FeedCommandDiscriminator.ScrollToBottom,
}

export type FeedCommand =
    | FeedScrollToBottom;

import type { OnNavHandler, OnClickHandler, OnKeyHandler, Hotkey } from "ui/hooks/useMain";

type HotkeyL = { [key in Hotkey]: KeyboardEvent };

export interface MainEvents extends HotkeyL {
    "click": Parameters<OnClickHandler>[0],
    "key": Parameters<OnKeyHandler>[0],
    "nav": Parameters<OnNavHandler>[0],
    "feed": FeedCommand,
}

export class MainEventEmitter extends ReactiveEventEmitter<MainEvents> { }

export const MainEEContext = createContext<MainEventEmitter>(null!);