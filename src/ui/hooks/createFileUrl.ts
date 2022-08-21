import { Accessor, Setter, createSignal, createEffect, onCleanup } from "solid-js";

type Nullable<T> = T | undefined | null;

// Managed URL to a local file object, which support NULL as a unique state.
export function createFileUrl(): [Accessor<Nullable<string>>, Accessor<Nullable<File>>, Setter<Nullable<File>>] {
    let [getFile, setFile] = createSignal<Nullable<File>>(),
        [getUrl, setUrl] = createSignal<Nullable<string>>();

    createEffect(() => {
        let f = getFile(), url: string | undefined;
        if(f) {
            url = URL.createObjectURL(f);
            onCleanup(() => URL.revokeObjectURL(url!))
        }

        setUrl(f === null ? null : url);
    });

    return [getUrl, getFile, setFile];
}