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
    if(action.type == Type.SET_THEME) {
        state = { temperature: action.temperature, is_light: action.is_light };
    }

    return state;
}