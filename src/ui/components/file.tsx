import { createMemo, createSignal, Match, onCleanup, Switch } from "solid-js";

import { categorize_mime } from "lib/mime";
import { MimeIcon } from "./mime";

export interface IMediaPreviewProps {
    file: File,
}

let Fallback = (props: IMediaPreviewProps) => <MimeIcon category={categorize_mime(props.file.name, props.file.type)} />;

export function MediaPreview(props: IMediaPreviewProps) {
    let [errored, setErrored] = createSignal(false),
        on_error = () => setErrored(true);

    let src = createMemo(() => {
        let src = URL.createObjectURL(props.file);
        onCleanup(() => URL.revokeObjectURL(src));

        return src;
    });

    let mt = createMemo(() => errored() ? "" : props.file.type);

    return (
        <Switch>
            {/*NOTE: If file.type is empty, the browser likely can't display it anyway*/}
            <Match when={!mt()}>
                <Fallback {...props} />
            </Match>

            <Match when={mt().startsWith("image/")}>
                <img class="ln-media" src={src()} on:error={on_error} />;
            </Match>

            <Match when={mt().startsWith("video/")}>
                <video class="ln-media" src={src()} controls loop on:error={on_error} />;
            </Match>

            <Match when={mt().startsWith("audio/")}>
                <audio class="ln-media" src={src()} controls on:error={on_error} />;
            </Match>
        </Switch>
    );
}