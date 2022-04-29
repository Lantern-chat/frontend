import type { ServerConfig } from "client-sdk/src/models";

declare global {
    interface Window { readonly config: ServerConfig; }
}
