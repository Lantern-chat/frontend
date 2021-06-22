import { createSelector } from 'reselect';
import { RootState } from 'state/root';

export interface ISelectedPath {
    path: string,
    parts: string[]
}

export const selectPath = createSelector(
    (state: RootState): string => state.history.location.pathname,
    path => ({
        path,
        parts: path.slice(1).split('/')
    } as ISelectedPath)
);
