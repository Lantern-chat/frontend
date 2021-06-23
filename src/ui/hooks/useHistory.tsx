import React, { createContext, Context, useMemo, useState, useEffect, useContext, useReducer } from 'react';

import { History, createBrowserHistory, BrowserHistoryOptions } from 'history';

export const HistoryContext: Context<History> = createContext<History>(null!);

/*
export function useHistory(options?: BrowserHistoryOptions): History {
    // only create BrowserHistory once by memoizing it
    let history = useMemo(() => createBrowserHistory(options), []);

    // force re-rendering by incrementing a counter
    let [counter, forceRender] = useState(0);

    // only once, listen on history changes and force render
    useEffect(() => history.listen((a) => forceRender(counter + 1)), []);

    return history;
}

export const HistoryProvider: React.FunctionComponent = ({ children }) => {
    let history = useHistory();

    return (
        <HistoryContext.Provider value={history}>
            {children}
        </HistoryContext.Provider>
    );
};
*/
