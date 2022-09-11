import { createRenderEffect, createSignal, JSX, Show } from "solid-js";
import { runBatched } from "ui/hooks/runBatched";
import { br } from "ui/utils";

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

import "./avatar.scss";
export function Avatar(props: IAvatarProps) {
    //let [loading, setLoading] = createSignal(true);

    // let will_set_loading: number;

    // let on_load = () => {
    //     clearTimeout(will_set_loading);

    //     if(loading()) {
    //         runBatched(() => setLoading(false));
    //     }
    // };

    // createRenderEffect(() => {
    //     if(props.url != null && will_set_loading != null) {
    //         // TODO: Figure out a way to batch this intelligently?
    //         will_set_loading = setTimeout(() => setLoading(true), 100);
    //     }
    // });

    // let on_load_img = (e: Event) => {
    //     let skeleton = (e.target as HTMLImageElement).previousElementSibling! as HTMLDivElement;
    //     skeleton.style.display = 'none';
    // };

    return (
        <div class="ln-avatar" {...props.props}>
            <div class="ln-avatar__wrapper" {...props.wrapper} title={props.username}>
                <Show when={props.url} fallback={
                    <span
                        class="ln-avatar__text"
                        style={{
                            "background-color": props.backgroundColor,
                            'border-radius': br(props.rounded)
                        }}
                    >
                        {props.children || props.text || '?'}
                    </span>
                }>
                    {/* <div class="ln-avatar__skel" /> */}

                    <img src={props.url!}
                        loading="lazy"
                        class="ln-avatar__image"
                        // onLoad={on_load_img}
                        alt={props.username}
                        style={{ 'border-radius': br(props.rounded) }}
                    />
                </Show>
            </div>

            {props.anchor}
        </div>
    );
}