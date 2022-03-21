import { createRenderEffect, createSignal, JSX, Show } from "solid-js";
import { runBatched } from "ui/hooks/runBatched";
import { Branch } from "../flow";

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

import "./avatar.scss";
export function Avatar(props: IAvatarProps) {
    let [loading, setLoading] = createSignal(false);

    let will_set_loading: undefined | number;

    let on_load = () => {
        clearTimeout(will_set_loading);

        if(loading()) {
            runBatched(() => setLoading(false));
        }
    };

    createRenderEffect(() => {
        if(props.url != null && will_set_loading != null) {
            // TODO: Figure out a way to batch this intelligently?
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