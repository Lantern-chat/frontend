import { Action, Type } from "../actions";

export interface IThemeState {
    temperature: number,
    is_light: boolean,
}

const DEFAULT_STATE: IThemeState = {
    temperature: 7500,
    is_light: false,
};

export function themeReducer(state: IThemeState = DEFAULT_STATE, action: Action) {
    return state;
}