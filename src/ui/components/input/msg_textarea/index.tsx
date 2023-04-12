import { createSignal, JSX, onCleanup, Show, splitProps, untrack } from "solid-js";

import { TextareaAutosize, TextareaHeightChangeMeta } from "ui/components/input/textarea";

import { useI18nContext } from "ui/i18n/i18n-solid";

import type { SetController } from "ui/hooks/createController";
import { createShallowMemo } from "ui/hooks/createShallowMemo";
import { parseHotkey, Hotkey } from "ui/hooks/useMain";

export interface IMsgTextareaProps {
    disabled?: boolean,
    mobile: boolean,
    spellcheck?: boolean,

    onChange(value: string): void;
    onBlur(): void;
    onFocus(): void;
    onKeyDown(e: KeyboardEvent): void;
    onContextMenu(e: MouseEvent): void;
    onSelectionChange?(ta: HTMLTextAreaElement, in_code: boolean): void;

    ref?: (el: HTMLTextAreaElement) => void;
    tac?: SetController<IMsgTextareaController>,
}

export interface IMsgTextareaController {
    focus(): void;
    setValue(value: string, change?: boolean): void;
    append(value: string): void;
    splice(start: number, remove: number, insert: string): void;
}

import "./textarea.scss";
export function MsgTextarea(props: IMsgTextareaProps) {
    let ref: HTMLTextAreaElement | undefined;

    onCleanup(() => ref = undefined);

    let { LL } = useI18nContext();

    let [local, taprops] = splitProps(props, ["mobile", "spellcheck", "onChange", "onKeyDown", "onSelectionChange", "tac", "ref"]);

    let setValue = (value: string, change: boolean = true) => {
        if(ref) {
            ref.value = value;
            // triggers a "change" event that in-turn triggers a resize
            change && (ref!.dispatchEvent(new Event("change", { bubbles: false })), props.onChange(value));
        }
    };

    local.tac?.({
        setValue,
        focus() {
            ref?.focus()
        },
        append(value: string) {
            if(ref) {
                setValue(ref.value + value);
            }
        },
        splice(start, remove = 0, insert = "") {
            if(ref) {
                let value = ref.value,
                    prefix = value.slice(0, start),
                    suffix = value.slice(start + remove);

                setValue(prefix + insert + suffix);
            }
        },
    });

    let [spellcheck, setSpellcheck] = createSignal(!!local.spellcheck),
        [rows, setRows] = createSignal(1);

    let onHeightChange = (height: number, { rowHeight }: TextareaHeightChangeMeta) => {
        setRows(Math.floor(height / rowHeight));
    };

    let onSelectionChange = (e: Event) => {
        let ta = e.target as HTMLTextAreaElement, in_code = isInsideCodeBlock(ta);
        setSpellcheck(!!local.spellcheck && !in_code);
        local.onSelectionChange?.(ta, in_code);
    };

    let onInput = (e: InputEvent) => {
        let ta = e.target as HTMLTextAreaElement;

        local.onChange(ta.value = ta.value.replace(/^\n+/, "")); // remove leading whitespace and trigger change
        onSelectionChange(e);
    };

    let onKeyUp = (e: KeyboardEvent) => {
        let hotkey = parseHotkey(e);
        if(hotkey == null || hotkey == Hotkey.FocusTextArea) {
            // not-hotkeys shouldn't escape, to save on processing time of keypress
            // or if the textarea is already focused, don't refocus
            e.stopPropagation();
        }
    };

    let onKeyDown = (e: KeyboardEvent) => {
        let { onKeyDown, mobile } = local,
            ta = e.target as HTMLTextAreaElement,
            value = ta.value,
            cursor = ta.selectionStart,
            stop_prop = true,
            modified = false,
            prevent_default = false,
            bubble = true;

        switch(e.key) {
            case "Enter": {
                let do_not_send = mobile || e.shiftKey || isInsideCodeBlock(ta);

                if(do_not_send) {
                    bubble = false;
                } else {
                    // do_send() done above in the tree
                    prevent_default = true;
                }

                break;
            }
            case "Tab": {
                prevent_default = true;

                if(e.shiftKey || isInsideCodeBlock(ta)) {
                    ta.value = value.slice(0, cursor) + "\t" + value.slice(cursor);
                    modified = true;

                    ta.selectionEnd = ta.selectionStart = cursor + 1;
                }

                break;
            }

            // HOTKEY allowances

            case "PageUp":
            case "PageDown": {
                stop_prop = false;
                break;
            }
            default: {
                if(e.ctrlKey || e.metaKey) {
                    stop_prop = false;
                }
            }
        }

        if(prevent_default) { e.preventDefault(); }
        if(stop_prop) { e.stopPropagation(); }
        if(modified) { local.onChange(ta.value); }
        if(bubble) { onKeyDown(e); }
    };

    let max_rows = () => local.mobile ? 5 : 20;

    let style = () => {
        if(rows() < max_rows()) {
            return { "overflow-y": "hidden" } as JSX.CSSProperties;
        }
        return;
    };

    // https://github.com/buildo/react-autosize-textarea/issues/52 but same thing with the Solid version
    return (
        <div class="ln-msg-textarea">
            <TextareaAutosize
                ref={r => (ref = r, props.ref?.(r))}
                {...taprops} // onBlur, onFocus, onContextMenu, disabled, etc.
                placeholder={LL().main.MESSAGE() + "..."}
                spellcheck={spellcheck()}
                style={style()}
                cacheMeasurements={false}
                rows={1} maxRows={max_rows()}
                onHeightChange={onHeightChange}
                onInput={onInput}
                onKeyDown={onKeyDown}
                onKeyUp={onKeyUp}
                maxlength={5000}
            />

            <Show when={taprops.disabled}>
                <span class="ln-msg-textarea__disable" />
            </Show>
        </div>
    );
}

function isInsideCodeBlock(ta: HTMLTextAreaElement): boolean {
    let cursor = ta.selectionStart, value = ta.value; // value is before new key

    // check if the cursor is inside a code block, in which case allow plain newlines
    let prev = { index: 0 }, delim, re = /`{3}/g, inside = false;
    for(let idx = 0; delim = re.exec(value); idx++) {
        if(prev.index <= cursor && cursor > delim.index) {
            inside = !inside;
        }
        prev = delim;
    }

    return inside;
}