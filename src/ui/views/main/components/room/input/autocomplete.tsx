import { scan_markdown } from "lib/markdown";
import { createEffect, For } from "solid-js";
import { SetController } from "ui/hooks/createController";
import { createTrigger } from "ui/hooks/createTrigger";

export interface IAutoCompleteProps {
    value: string,
    pos: number,
    acc: SetController<IAutoCompleteController>,
    onChange(completing: boolean): void;
}

export interface IAutoCompleteController {
    accept(): void;
    keydown(e: KeyboardEvent): void;
}

import "./autocomplete.scss";
export function AutoComplete(props: IAutoCompleteProps) {
    return null;

    let test = ["a", "b", "c"];

    let spans = [], [track, dirty] = createTrigger();

    createEffect(() => {
        spans = [];
        if(props.pos == 0) return;


    });


    return (
        <ul class="ln-msg-ac">
            <For each={test}>
                {(v) => <li>{v}</li>}
            </For>
        </ul>
    )
}