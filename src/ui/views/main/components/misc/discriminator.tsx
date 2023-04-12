import { Show } from "solid-js";
import { usePrefs } from "state/contexts/prefs";

export interface IDiscriminatorProps {
    discriminator: number,
}

import "./discriminator.scss";
export function Discriminator(props: IDiscriminatorProps) {
    //let prefs = usePrefs();

    let not_streamer_mode = () => true;

    return (
        <Show when={not_streamer_mode()}>
            <span class="discriminator">#{props.discriminator.toString(16).padStart(4, "0")}</span>
        </Show>
    );
}