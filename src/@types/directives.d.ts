import { JSX } from "solid-js";

declare module "solid-js" {
    namespace JSX {
        interface Directives {
            clickEater: Array<"click" | "contextmenu" | "touch">;
        }
    }
}