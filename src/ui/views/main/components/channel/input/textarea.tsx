import React, { createRef } from "react";
import TextareaAutosize, { TextareaHeightChangeMeta } from 'react-textarea-autosize';

import { shallowEqualObjects, shallowEqualObjectsExclude } from "lib/compare";
import { parseHotkey, Hotkey } from "ui/hooks/useMainClick";

export interface IMsgTextareaProps {
    disabled?: boolean,
    mobile: boolean,
    spellcheck?: boolean,

    onChange(value: string): void;
    onBlur(): void;
    onFocus(): void;
    onChange(value: string): void;
    onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>): void;
    onContextMenu(e: React.MouseEvent<HTMLTextAreaElement>): void;
    onSelectionChange?(ta: HTMLTextAreaElement, in_code: boolean): void;
}

interface IMsgTextareaState {
    rows: number,
    spellcheck: boolean,
}

import "./textarea.scss";
export class MsgTextarea extends React.Component<IMsgTextareaProps, IMsgTextareaState> {
    public ta: React.RefObject<HTMLTextAreaElement> = createRef();

    public setValue(value: string) {
        let ta = this.ta.current;
        if(ta) {
            this.value = ta.value = value;
            ta.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }

    public focus() {
        this.ta.current?.focus();
    }

    constructor(props: IMsgTextareaProps) {
        super(props);

        this.state = { rows: 1, spellcheck: !!props.spellcheck };
    }

    componentDidMount() {
        this.ta.current!.addEventListener('selectionchange', this.onSelectionChange.bind(this));
    }

    shouldComponentUpdate(nextProps: IMsgTextareaProps, nextState: IMsgTextareaState): boolean {
        return !(
            shallowEqualObjects(this.state, nextState) &&
            shallowEqualObjects(this.props, nextProps)
        );
    }

    /// Outside of React, keep a backup of the value, and assign it when the DOM is changed
    /// Also doubles as an easy-access value
    public value: string = "";

    ta2?: HTMLTextAreaElement;

    componentDidUpdate() {
        let ta = this.ta.current;

        // if there is a textarea, and it does not match the one recorded
        if(ta && this.ta2 !== ta) {
            ta.value = this.value;
            this.ta2 = ta;
        }
    }

    onHeightChange(height: number, { rowHeight }: TextareaHeightChangeMeta) {
        this.setState({ rows: Math.floor(height / rowHeight) });
    }

    onKeyUp(e: React.KeyboardEvent) {
        let hotkey = parseHotkey(e.nativeEvent);
        if(hotkey == null || hotkey == Hotkey.FocusTextArea) {
            // not-hotkeys shouldn't escape, to save on processing time of keypress
            // or if the textarea is already focused, don't refocus
            e.stopPropagation();
        }
    }

    onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        let { onKeyDown, mobile } = this.props,
            ta = e.currentTarget,
            value = ta.value,
            cursor = ta.selectionStart,
            stop_prop = true,
            modified = false,
            prevent_default = false,
            bubble = true;

        switch(e.key) {
            case 'Enter': {
                let do_not_send = mobile || e.shiftKey || value.length == 0 || isInsideCodeBlock(ta);

                if(do_not_send) {
                    bubble = false;
                } else {
                    // do_send() done above in the tree
                    prevent_default = true;
                }

                break;
            }
            case 'Tab': {
                prevent_default = true;

                if(e.shiftKey || isInsideCodeBlock(ta)) {
                    ta.value = value.slice(0, cursor) + '\t' + value.slice(cursor);
                    modified = true;

                    ta.selectionEnd = ta.selectionStart = cursor + 1;
                }

                break;
            }

            // HOTKEY allowances

            case 'PageUp':
            case 'PageDown': {
                stop_prop = false;
                break;
            }
            default: {
                if(e.ctrlKey || e.metaKey) {
                    stop_prop = false;
                }
            }
        }

        if(prevent_default) {
            e.preventDefault();
        }

        if(stop_prop) {
            e.stopPropagation();
        }

        if(modified) {
            this.props.onChange(ta.value);
        }

        if(bubble) {
            onKeyDown(e);
        }
    }

    onChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
        let ta = e.currentTarget, value = ta.value = ta.value.replace(/^\n+/, ''); // remove leading whitespace
        this.props.onChange(this.value = value); // don't forget to record the new value
        this.onSelectionChange(e.nativeEvent);
    }

    onSelectionChange(e: Event) {
        let ta: HTMLTextAreaElement = e.target as HTMLTextAreaElement,
            { onSelectionChange } = this.props,
            do_spellcheck = this.props.spellcheck && !isInsideCodeBlock(ta);

        this.setState({ spellcheck: !!do_spellcheck });

        if(onSelectionChange) {
            onSelectionChange(ta, isInsideCodeBlock(ta));
        }
    }

    // binded callbacks for memoization
    onhc = this.onHeightChange.bind(this);
    onku = this.onKeyUp.bind(this);
    onkd = this.onKeyDown.bind(this);
    onch = this.onChange.bind(this);

    render() {
        let { disabled, mobile, onBlur, onFocus, onContextMenu } = this.props,
            style, max_rows = mobile ? 5 : 20;

        if(this.state.rows < max_rows) {
            style = { overflowY: 'hidden' };
        }

        // https://github.com/buildo/react-autosize-textarea/issues/52
        return (
            <div className="ln-msg-textarea">
                {disabled ? <span className="ln-msg-textarea__disable"></span> : null}

                <TextareaAutosize
                    disabled={disabled}
                    onBlur={onBlur}
                    onFocus={onFocus}
                    onContextMenu={onContextMenu}
                    cacheMeasurements={false}
                    ref={this.ta}
                    placeholder="Message..."
                    rows={1} maxRows={max_rows}
                    style={style as any}
                    onHeightChange={this.onhc}
                    onKeyUp={this.onku}
                    onKeyDown={this.onkd}
                    onChange={this.onch}
                    spellCheck={this.state.spellcheck}
                />
            </div>
        )
    }
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