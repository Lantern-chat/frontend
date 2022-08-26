import { Accessor, createContext, createEffect, createMemo, createSignal, onCleanup, onMount, Setter, useContext } from "solid-js";
import { createRef, Ref } from "./createRef";

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

    PrevTextChannel, // previous channel in party, in order
    NextTextChannel, // next channel in party, in order
    ReturnChannel, // return to previous channel, history-wise

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
        hot: Hotkey.PrevTextChannel,
        key: "ArrowUp",
        mod: ALT_MODIFIER,
    },
    {
        hot: Hotkey.NextTextChannel,
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

export type OnClickHandler = (e: MouseEvent) => void;
export type OnKeyHandler = (e: KeyboardEvent) => void;
export type OnNavHandler = (url: string | undefined) => (boolean | Promise<boolean>);

export interface IMainContext {
    main: Ref<HTMLElement | undefined>,

    addOnClick(listener: OnClickHandler): void;
    removeOnClick(listener: OnClickHandler): void;
    addOnHotkey(hotkey: Hotkey, listener: OnKeyHandler): void;
    removeOnHotkey(hotkey: Hotkey, listener: OnKeyHandler): void;

    clickAll(e: MouseEvent): void;
    triggerHotkey(hotkey: Hotkey, e: KeyboardEvent): void;
    triggerAnyHotkey(e: KeyboardEvent): void;
    hasKey(key: string): boolean;
    consumeKey(key: string): boolean;

    addOnNav(listener: OnNavHandler): void;
    removeOnNav(listener: OnNavHandler): void;

    tryNav(url: string | undefined): boolean | Promise<boolean>;
}

const noop = () => { };
export const MainContext = createContext<IMainContext>({
    main: createRef(),
    addOnClick: noop,
    removeOnClick: noop,
    clickAll: noop,
    addOnHotkey: noop,
    removeOnHotkey: noop,
    triggerHotkey: noop,
    triggerAnyHotkey: noop,
    hasKey: () => false,
    consumeKey: () => false,
    addOnNav: noop,
    removeOnNav: noop,
    tryNav: () => true,
});

export function useOnNav(cb: OnNavHandler) {
    let main = useContext(MainContext);

    onMount(() => {
        main.addOnNav(cb);
        onCleanup(() => main.removeOnNav(cb));
    });
}

const EVENTS = {
    'onClick': 'on:click',
    'onContextMenu': 'on:contextmenu',
    'onTouch': 'on:touch',
} as const;

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

export function useMainClick(opt: IMainClickOptions) {
    let main = useContext(MainContext);

    let props: ClickEventProps = {};

    for(let key in EVENTS) {
        let cb: OnClickHandler | undefined = opt[key];
        if(cb) {
            props[EVENTS[key]] = (e: MouseEvent) => {
                if(!main.consumeKey('Shift')) {
                    cb!(e);
                } else {
                    e.stopPropagation();
                }
            };
        }
    }

    createEffect(() => {
        if(opt.active()) {
            let listener = (e: MouseEvent) => opt.onMainClick(e);
            main.addOnClick(listener);
            onCleanup(() => main.removeOnClick(listener));
        }
    });

    return props;
}

export function useMainHotkey(hotkey: Hotkey, cb: OnKeyHandler) {
    let main = useContext(MainContext);

    createEffect(() => {
        let listener = (e: KeyboardEvent) => cb(e);
        main.addOnHotkey(hotkey, listener);
        onCleanup(() => main.removeOnHotkey(hotkey, listener));
    });
}

export function useMainHotkeys(hotkeys: Hotkey[], cb: (hotkey: Hotkey, e: KeyboardEvent) => void) {
    let main = useContext(MainContext);

    createEffect(() => {
        let listeners = hotkeys.map((k): [Hotkey, OnKeyHandler] => [k, (e: KeyboardEvent) => cb(k, e)]);

        for(let [k, listener] of listeners) {
            main.addOnHotkey(k, listener);
        }

        onCleanup(() => {
            for(let [k, listener] of listeners) {
                main.removeOnHotkey(k, listener);
            }
        })
    });
}

export interface Position {
    left: number,
    top: number,
}

export interface ISimpleMainClickOptions {
    onMainClick: OnClickHandler,
}

export function createSimplePositionedContextMenu(opts?: ISimpleMainClickOptions): [get: Accessor<Position | null>, props: ClickEventProps] {
    let [pos, setPos] = createSignal<Position | null>(null);

    let props = useMainClick({
        active: () => !!pos(),
        onMainClick: e => { setPos(null); opts?.onMainClick(e); },
        onContextMenu: e => {
            setPos({ top: e.clientY, left: e.clientX });
            e.stopPropagation();
            e.preventDefault();
        },
    });

    return [pos, props];
}

export function createSimpleToggleOnClick(opts?: ISimpleMainClickOptions): [Accessor<boolean>, ClickEventProps, Setter<boolean>] {
    let [show, setShow] = createSignal(false);

    // track element this is listening to
    let el: null | EventTarget;

    let props = useMainClick({
        active: show,
        onMainClick: (e: MouseEvent) => { if(el != e.currentTarget) { setShow(false); opts?.onMainClick(e); } },
        onClick: (e: MouseEvent) => {
            el = e.currentTarget; setShow(v => !v); e.stopPropagation();
        }
    });

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