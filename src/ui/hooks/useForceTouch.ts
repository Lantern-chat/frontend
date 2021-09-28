import React, { useCallback, useEffect, useRef, useState } from "react";

export type ForceTouchEvent<T> = React.MouseEvent<T>;

export interface IForceTouchProps<T> {

}

// ForceTouchState
enum FTS {
    Rest,
    ForceWillBegin,
    MouseDown,
    ForceChanged,
    MouseUp,
    ForceMouseDown,
    ForceMouseUp,
}

const FSM = [
    [FTS.Rest, FTS.MouseDown, FTS.MouseDown],
    [FTS.MouseDown, FTS.ForceMouseDown, FTS.ForceMouseDown],
    [FTS.ForceMouseDown, FTS.ForceMouseUp, FTS.MouseDown],
];

function next(state: FTS, event: FTS): FTS {
    for(let [from, to, next] of FSM) {
        if(state == from && event == to) return next;
    }
    return FTS.Rest;
}

//function next(state: FTS, event: FTS): FTS {
//    if(state == FTS.Rest && event == FTS.MouseDown) { return FTS.MouseDown; }
//    //if(state == FTS.MouseDown && event == FTS.MouseUp) { return FTS.Rest; }
//    if(state == FTS.MouseDown && event == FTS.ForceMouseDown) { return FTS.ForceMouseDown; }
//    if(state == FTS.ForceMouseDown && event == FTS.ForceMouseUp) { return FTS.MouseDown; }
//    return FTS.Rest;
//}

export function useForceTouch<T extends HTMLElement>(cb: ForceTouchEvent<T>): React.MutableRefObject<T | null> {
    let ref = useRef<T>(null);
    let fsm = useRef(FTS.Rest);

    useEffect(() => {
        let e = ref.current;
        if(!e) return;

        e.addEventListener('webkitmouseforcewillbegin', () => { });

    }, [ref.current, fsm]);

    let [state, setState] = useState(FTS.Rest);

    let on_webkitmouseforcedown = useCallback(() => {
        setState(next(state, FTS.ForceMouseUp));
    }, [state]);

    let on_webkitmouseforceup = useCallback(() => {

    }, [state]);

    return ref;
}