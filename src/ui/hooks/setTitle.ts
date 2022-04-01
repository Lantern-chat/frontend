import { Accessor, createRenderEffect } from "solid-js";

export function setTitle(title: Accessor<string>) {
    createRenderEffect(() => {
        document.title = title();
    });
}