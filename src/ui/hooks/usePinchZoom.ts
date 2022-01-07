import React, { useCallback, useRef } from "react";

interface IPinchState {
    cache: Array<React.TouchEvent>,
    prev: number,
}

export function usePinchZoom(cb: () => void): { [key: string]: React.TouchEventHandler } {
    let state = useRef<IPinchState>({
        cache: [],
        prev: -1,
    });

    let onTouchStart = useCallback((e: React.TouchEvent) => {
        state.current.cache.push(e);
    }, []);

    let onTouchMove = useCallback((e: React.TouchEvent) => {
        let cache = state.current.cache;
        for(let i = 0; i < cache.length; i++) {

        }

        //
    }, []);

    let onTouchEnd = useCallback((e: React.TouchEvent) => {
        //
    }, []);

    let onTouchCancel = useCallback((e: React.TouchEvent) => {
        //
    }, []);

    return { onTouchStart, onTouchMove, onTouchEnd, onTouchCancel }
}