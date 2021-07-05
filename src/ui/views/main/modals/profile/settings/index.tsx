import { useState } from "react"

function genEmptySettings(name: string) {
    return () => {
        return <span>{name} Settings here</span>
    }
}

const SETTINGS = {
    'Account': genEmptySettings('Account'),
    'Profile': genEmptySettings('Profile'),
    'Appearance': genEmptySettings('Appearance'),
}

const KEYS = Object.keys(SETTINGS);

import "./settings.scss";
export const Settings = () => {
    let [page, setPage] = useState(KEYS[0]);

    let Setting = SETTINGS[page];

    return (
        <div className="ln-settings">
            <div className="ln-settings__nav">
                <ul>
                    {KEYS.map(key => (
                        <li key={key} onClick={() => setPage(key)}>
                            {key}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="ln-settings__setting"><Setting /></div>
        </div>
    )
}