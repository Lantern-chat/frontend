import { useReducer } from "react";

export function useForceRender(): () => void {
    return useReducer(s => s + 1, 0)[1];
}