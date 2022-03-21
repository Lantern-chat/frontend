import { batch, createEffect, createMemo, createRenderEffect, createSignal, JSX, Show } from "solid-js";
import { Branch } from "../flow";

import "./avatar.scss";

export interface IAvatarProps {
    rounded?: boolean,
    url?: string,
    text?: string,
    backgroundColor?: string,
    username: string,
    wrapper?: JSX.HTMLAttributes<HTMLDivElement>,
    children?: any,
    props?: JSX.HTMLAttributes<HTMLDivElement>,
    anchor?: any,
}

// The skeleton system here kicks in after 100ms of load time on each avatar.
// Once images are loaded, they are batched together in 5ms increments
// to avoid thrashing the UI

let pending: Array<() => void> = [];

function run_pending() {
    if(pending.length) {
        __DEV__ && console.log("Batching", pending.length);

        batch(() => pending.forEach(cb => cb()));
        pending = [];
    }
}

export function Avatar(props: IAvatarProps) {
    let [loading, setLoading] = createSignal(false);

    let will_set_loading: number | undefined;

    // when hundreds of avatars load at once, it thrashes the DOM to change the classList for all of them
    // so slowly mark them as loaded as everything else loads in
    let on_load = () => {
        clearTimeout(will_set_loading);

        if(loading()) {
            pending.push(() => setLoading(false));
            setTimeout(() => run_pending(), 5);
        }
    };

    createRenderEffect(() => {
        if(props.url != null && will_set_loading != null) {
            will_set_loading = setTimeout(() => setLoading(true), 100);
        }
    });

    return (
        <div className="ln-avatar" {...props.props}>
            <div className="ln-avatar__wrapper" {...props.wrapper} title={props.username}>
                <Branch>
                    <Branch.If when={props.url != null}>
                        <Show when={loading()}>
                            <div className="ln-avatar__skel" />
                        </Show>

                        <img src={props.url}
                            className="ln-avatar__image"
                            classList={{ 'ln-avatar--rounded': props.rounded }}
                            onLoad={on_load}
                            alt={props.username} />
                    </Branch.If>

                    <Branch.Else>
                        <span
                            className="ln-avatar__text"
                            classList={{ 'ln-avatar--rounded': props.rounded }}
                            style={{ "background-color": props.backgroundColor }}
                        >
                            {props.children || props.text || '?'}
                        </span>
                    </Branch.Else>
                </Branch>
            </div>

            {props.anchor}
        </div>
    );
}