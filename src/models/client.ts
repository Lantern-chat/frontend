import React from "react";

import { Party } from "./party";

export interface Client {
    parties: Array<Party>,
}

export const ClientContext = React.createContext<Client>(null!);