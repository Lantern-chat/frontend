import { Action, Type } from "../actions";

export interface IThemeState {
    temperature: number,
    light: boolean,
}

const DEFAULT_STATE: IThemeState = {
    temperature: 6500,
    light: false,
};

export function themeReducer(state: IThemeState = DEFAULT_STATE, action: Action) {
    return state;
}