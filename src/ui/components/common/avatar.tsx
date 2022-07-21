import { createRenderEffect, createSignal, JSX, Show } from "solid-js";
import { runBatched } from "ui/hooks/runBatched";
import { Branch } from "../flow";

export interface IAvatarProps {
    rounded?: number | boolean,
    url?: string | null,
    text?: string | null,
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

function br(value: number | boolean | undefined): undefined | string {
    return value ? (+value * 100 + '%') : undefined;
}

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
        <div class="ln-avatar" {...props.props}>
            <div class="ln-avatar__wrapper" {...props.wrapper} title={props.username}>
                <Branch>
                    <Branch.If when={props.url}>
                        <Show when={loading()}>
                            <div class="ln-avatar__skel" />
                        </Show>

                        <img src={props.url!}
                            class="ln-avatar__image"
                            onLoad={on_load}
                            alt={props.username}
                            style={{ 'border-radius': br(props.rounded) }}
                        />
                    </Branch.If>

                    <Branch.Else>
                        <span
                            class="ln-avatar__text"
                            style={{
                                "background-color": props.backgroundColor,
                                'border-radius': br(props.rounded)
                            }}
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