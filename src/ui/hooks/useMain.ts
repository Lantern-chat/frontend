import { ReactiveEventEmitter } from "lib/event_emitter";
import { Accessor, createContext, createSignal, onCleanup, onMount, Setter, useContext } from "solid-js";
import { MainEventEmitter } from "ui/views/main/state";

export const enum Hotkey {
    __NONE = 1,// start at 1 to simplify logic


    // Context-sensitive escape
    Escape,

    // Tab
    FocusTextArea,

    // Ctrl+Alt+ArrowUp
    PrevParty,
    // Cltr+Alt+ArrowDown
    NextParty,

    PrevTextRoom, // previous room in party, in order
    NextTextRoom, // next room in party, in order
    ReturnRoom, // return to previous room, history-wise

    ToggleEmotePicker,
    ToggleLightTheme,

    FeedPageUp,
    FeedPageDown,
    FeedArrowUp,
    FeedArrowDown,
    FeedEnd,

    Plus,
    Minus,
    Equals,

    __MAX_HOTKEY
}

const CTRL_MODIFIER = 1 << 0;
const SHIFT_MODIFIER = 1 << 1;
const ALT_MODIFIER = 1 << 2;

interface IHotkeySpec {
    mod?: number,
    key: string,
    hot: Hotkey,
}

const HOTKEYS: IHotkeySpec[] = [
    {
        hot: Hotkey.Escape,
        key: "Escape",
    },
    {
        hot: Hotkey.FocusTextArea,
        key: "Tab",
    },
    {
        hot: Hotkey.PrevParty,
        key: "ArrowUp",
        mod: CTRL_MODIFIER | ALT_MODIFIER,
    },
    {
        hot: Hotkey.NextParty,
        key: "ArrowDown",
        mod: CTRL_MODIFIER | ALT_MODIFIER,
    },
    {
        hot: Hotkey.PrevTextRoom,
        key: "ArrowUp",
        mod: ALT_MODIFIER,
    },
    {
        hot: Hotkey.NextTextRoom,
        key: "ArrowDown",
        mod: ALT_MODIFIER,
    },
    {
        hot: Hotkey.FeedArrowUp,
        key: "ArrowUp",
    },
    {
        hot: Hotkey.FeedArrowDown,
        key: "ArrowDown",
    },
    {
        hot: Hotkey.FeedPageUp,
        key: "PageUp",
    },
    {
        hot: Hotkey.FeedPageDown,
        key: "PageDown",
    },
    {
        hot: Hotkey.FeedEnd,
        key: "End",
    },
    {
        hot: Hotkey.ToggleEmotePicker,
        key: "e",
        mod: CTRL_MODIFIER,
    },
    {
        hot: Hotkey.ToggleLightTheme,
        key: "t",
        mod: CTRL_MODIFIER,
    },
    {
        hot: Hotkey.Plus,
        key: "+"
    },
    {
        hot: Hotkey.Minus,
        key: "-"
    }
];

interface IHotkeyLookupTable {
    // position in array is the modifier combo as binary
    [key: string]: Array<Hotkey | undefined>,
}

var LOOKUP: IHotkeyLookupTable = {};

for(let hotkey of HOTKEYS) {
    let key = hotkey.key.toLowerCase();
    let key_modifiers = LOOKUP[key];
    if(!key_modifiers) {
        key_modifiers = LOOKUP[key] = new Array(ALT_MODIFIER | SHIFT_MODIFIER | CTRL_MODIFIER);
    }
    key_modifiers[hotkey.mod || 0] = hotkey.hot;
}

if(__DEV__) {
    console.log(LOOKUP);
}

export function parseHotkey(e: KeyboardEvent): Hotkey | undefined {
    // TODO: Handle Apple keyboards?
    if(e.metaKey) return;

    let key_modifiers, mod = e.ctrlKey ? CTRL_MODIFIER : 0;
    mod |= e.shiftKey ? SHIFT_MODIFIER : 0;
    mod |= e.altKey ? ALT_MODIFIER : 0;

    if(key_modifiers = LOOKUP[e.key.toLowerCase()]) {
        return key_modifiers[mod];
    }

    return;
}

export type NavEvent = [url: string | undefined, wait_until: (p: Promise<boolean>) => void];

export type OnClickHandler = (e: MouseEvent) => void;
export type OnKeyHandler = (e: KeyboardEvent) => void;
export type OnNavHandler = (e: NavEvent) => void;

export interface IMainContext {
    main: () => HTMLDivElement,
    events: MainEventEmitter,

    triggerHotkey(hotkey: Hotkey, e: KeyboardEvent): void;
    triggerAnyHotkey(e: KeyboardEvent): void;
    hasKey(key: string): boolean;
    consumeKey(key: string): boolean;

    tryNav(url: string | undefined): boolean | Promise<boolean>;
}

const noop = () => { };
export const MainContext = createContext<IMainContext>({
    main: () => null!,
    events: new MainEventEmitter(),
    triggerHotkey: noop,
    triggerAnyHotkey: noop,
    hasKey: () => false,
    consumeKey: () => false,
    tryNav: () => true,
});

export function useOnNavAsync(cb: (url: string | undefined) => Promise<boolean>) {
    useOnNav(([url, wait_until]) => wait_until(cb(url)));
}

export function useOnNav(cb: OnNavHandler) {
    useContext(MainContext).events.on("nav", cb);
}

const EVENTS = {
    "onClick": "onClick",
    "onContextMenu": "onContextMenu",
    "onTouch": "on:touch",
};

type ClickEventHandlers = {
    [K in keyof typeof EVENTS]?: OnClickHandler;
};

type ClickEventProps = {
    [K in keyof typeof EVENTS as typeof EVENTS[K]]?: OnClickHandler;
};

export interface IMainClickOptions extends ClickEventHandlers {
    active: Accessor<boolean>,
    onMainClick: OnClickHandler,
}

export function useMainClick(opt: IMainClickOptions, main: IMainContext = useContext(MainContext)) {
    let props: ClickEventProps = {};

    for(let key in EVENTS) {
        let cb: OnClickHandler | undefined = opt[key as keyof typeof EVENTS];
        if(cb) {
            props[EVENTS[key as keyof typeof EVENTS]] = (e: MouseEvent) => {
                if(!main.consumeKey("Shift")) {
                    cb!(e);
                } else {
                    e.stopPropagation();
                }
            };
        }
    }

    main.events.on('click', opt.onMainClick, opt.active);

    return props;
}

export function useMainHotkey(hotkey: Hotkey, cb: OnKeyHandler) {
    useContext(MainContext).events.on(hotkey, cb);
}

export function useMainHotkeys(hotkeys: Hotkey[], cb: (hotkey: Hotkey, e: KeyboardEvent) => void) {
    let main = useContext(MainContext);

    hotkeys.forEach((key) => main.events.on(key, (e: KeyboardEvent) => cb(key, e)));
}

export interface Position {
    left: number,
    top: number,
}

export interface ISimpleMainClickOptions {
    onMainClick: OnClickHandler,
}

export function createSimplePositionedContextMenu(opts?: ISimpleMainClickOptions, main?: IMainContext): [get: Accessor<Position | null>, props: ClickEventProps] {
    let [pos, setPos] = createSignal<Position | null>(null);

    let props = useMainClick({
        active: () => !!pos(),
        onMainClick: e => { setPos(null); opts?.onMainClick(e); },
        onContextMenu: e => {
            setPos({ top: e.clientY, left: e.clientX });
            e.stopPropagation();
            e.preventDefault();
        },
    }, main);

    return [pos, props];
}

export function createSimpleToggleOnClick(opts?: ISimpleMainClickOptions, main?: IMainContext): [Accessor<boolean>, ClickEventProps, Setter<boolean>] {
    let [show, setShow] = createSignal(false);

    // track element this is listening to
    let el: null | EventTarget;

    let props = useMainClick({
        active: show,
        onMainClick: (e: MouseEvent) => { if(el != e.currentTarget) { setShow(false); opts?.onMainClick(e); } },
        onClick: (e: MouseEvent) => {
            el = e.currentTarget; setShow(v => !v); e.stopPropagation();
        }
    }, main);

    return [show, props, setShow];
}

export function createClickEater(): (e: MouseEvent) => void {
    return e => e.stopPropagation();
}

export function clickEater(el: HTMLElement, events: Accessor<Array<"click" | "contextmenu" | "touch">>) {
    let evs = events(), eat = createClickEater();
    evs.forEach(ev => el.addEventListener(ev, eat));
    onCleanup(() => evs.forEach(ev => el.removeEventListener(ev, eat)));
}