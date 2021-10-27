import React, { createContext, useContext, useEffect, useCallback, useMemo, useState } from "react";

export enum Hotkey {
    // Tab
    FocusTextArea = 1, // start at 1 to simplify logic

    // Ctrl+Alt+ArrowUp
    PrevParty,
    // Cltr+Alt+ArrowDown
    NextParty,

    PrevTextChannel, // previous channel in party, in order
    NextTextChannel, // next channel in party, in order
    ReturnChannel, // return to previous channel, history-wise

    ToggleEmotePicker,


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
        hot: Hotkey.ToggleEmotePicker,
        key: "e",
        mod: CTRL_MODIFIER,
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

export function parseHotkey(e: React.KeyboardEvent): Hotkey | undefined {
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

export type OnClickHandler = (e: React.MouseEvent) => void;
export type OnKeyHandler = (e: React.KeyboardEvent) => void;

export interface IMainContext {
    addOnClick(listener: OnClickHandler): void,
    removeOnClick(listener: OnClickHandler): void,
    addOnHotkey(hotkey: Hotkey, listener: OnKeyHandler): void,
    removeOnHotkey(hotkey: Hotkey, listener: OnKeyHandler): void,

    clickAll(e: React.MouseEvent): void,
    triggerHotkey(hotkey: Hotkey, e: React.KeyboardEvent): void,
    triggerAnyHotkey(e: React.KeyboardEvent): void,
}

const noop = () => { };
export const MainContext = createContext<IMainContext>({
    addOnClick: noop,
    removeOnClick: noop,
    clickAll: noop,
    addOnHotkey: noop,
    removeOnHotkey: noop,
    triggerHotkey: noop,
    triggerAnyHotkey: noop,
});

// TODO: Move this someplace useful
type ObjectFromList<T extends ReadonlyArray<string>, V = string> = {
    [K in (T extends ReadonlyArray<infer U> ? U : never)]: V
};

const EVENTS = ['onClick', 'onContextMenu', 'onTouch'] as const;

type ClickEventHandlers = Partial<ObjectFromList<typeof EVENTS, OnClickHandler>>;

export interface IMainClickOptions extends ClickEventHandlers {
    active: boolean,
    onMainClick: OnClickHandler,
}

// The behavior of this is a bit odd. All fields of opt are memoized except for `active`,
// which can be used to cheaply toggle the effect
export function useMainClick(opt: IMainClickOptions, deps: any[]): ClickEventHandlers {
    let main = useContext(MainContext), active = opt.active;

    // cache opt and props, including callbacks
    let res = useMemo(() => {
        let props: ClickEventHandlers = {};

        for(let key of EVENTS) {
            // block scoped, moved into closure
            let cb: OnClickHandler | undefined;
            if(cb = opt[key]) { // check undefined while assigning
                props[key] = (e: React.MouseEvent) => { main.clickAll(e); cb!(e); };
            }
        }

        return { opt, props };
    }, [main, ...deps]);

    useEffect(() => {
        if(!active) return;

        let listener = (e: React.MouseEvent) => res.opt.onMainClick(e);
        main.addOnClick(listener);
        return () => main.removeOnClick(listener);
    }, [active, res]); // res includes check for main

    return res.props;
}

export function useMainHotkey(hotkey: Hotkey, cb: OnKeyHandler) {
    let main = useContext(MainContext);

    useEffect(() => {
        // TODO: Remove indirection?
        let listener = (e: React.KeyboardEvent) => cb(e);
        main.addOnHotkey(hotkey, listener);
        return () => main.removeOnHotkey(hotkey, listener);
    }, [main, hotkey]);
}

export interface Position {
    left: number,
    top: number,
}

export interface ISimpleMainClickOptions {
    onMainClick: OnClickHandler,
}

export function useSimplePositionedContextMenu(opts?: ISimpleMainClickOptions): [Position | null, ClickEventHandlers] {
    let [pos, setPos] = useState<Position | null>(null);

    let props = useMainClick({
        active: !!pos,
        onMainClick: (e: React.MouseEvent) => { setPos(null); opts?.onMainClick(e); },
        onContextMenu: (e: React.MouseEvent) => {
            setPos({ top: e.clientY, left: e.clientX });
            e.stopPropagation();
            e.preventDefault();
        },
    }, []);

    return [pos, props];
}

export function useSimpleToggleOnClick(opts?: ISimpleMainClickOptions): [boolean, ClickEventHandlers] {
    let [show, setShow] = useState(false);

    let props = useMainClick({
        active: show,
        onMainClick: (e: React.MouseEvent) => { setShow(false); opts?.onMainClick(e); },
        onClick: (e: React.MouseEvent) => {
            setShow(true);
            e.stopPropagation();
        }
    }, []);

    return [show, props];
}