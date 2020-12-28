import React from "react";

import { IParty } from "./party";

export interface Client {
    parties: Array<IParty>,
}

export const ClientContext = React.createContext<Client>(null!);