import React, { createRef } from "react";

import { shallowEqualObjects, shallowEqualObjectsExclude } from "lib/compare";

import TextareaAutosize, { TextareaHeightChangeMeta } from 'react-textarea-autosize';

import { parseHotkey, Hotkey } from "ui/hooks/useMainClick";

export interface IMsgTextareaProps {
    disabled?: boolean,
    value: string,
    mobile: boolean,
    taRef?: React.RefObject<HTMLTextAreaElement>;
    spellcheck?: boolean,

    onChange(value: string): void;
    onBlur(): void;
    onFocus(): void;
    onChange(value: string): void;
    onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>): void;
    onContextMenu(e: React.MouseEvent<HTMLTextAreaElement>): void;
}

interface IMsgTextareaState {
    rows: number,
    spellcheck: boolean,
}

import "./textarea.scss";
export class MsgTextarea extends React.Component<IMsgTextareaProps, IMsgTextareaState> {
    ta: React.RefObject<HTMLTextAreaElement> = this.props.taRef || createRef();

    constructor(props: IMsgTextareaProps) {
        super(props);

        this.state = { rows: 1, spellcheck: !!props.spellcheck };
    }

    shouldComponentUpdate(nextProps: IMsgTextareaProps, nextState: IMsgTextareaState): boolean {
        let ta = this.ta.current,
            // textarea can lose position when overwriting with the same value,
            // so compare to it directly rather than the previous props
            same_value = ta ? ta.value == nextProps.value : false;

        return !(
            same_value &&
            shallowEqualObjects(this.state, nextState) &&
            shallowEqualObjectsExclude(this.props, nextProps, ['value'])
        );
    }

    static getDerivedStateFromProps(props: IMsgTextareaProps, state: IMsgTextareaState) {
        // reset rows if value erased
        if(props.value.length == 0) {
            return { rows: 1 };
        }

        return null;
    }

    componentDidMount() {
        this.ta.current!.addEventListener('selectionchange', this.onSelectionChange.bind(this));
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
            bubble = true;

        switch(e.key) {
            case 'Enter': {
                let do_not_send = mobile || e.shiftKey || value.length == 0 || isInsideCodeBlock(ta);

                if(do_not_send) {
                    bubble = false;
                } else {
                    // do_send() done above in the tree
                    e.preventDefault();
                }

                break;
            }
            case 'Tab': {
                e.preventDefault();

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
        let ta = e.currentTarget;
        ta.value = ta.value.replace(/^\n+/, ''); // remove leading whitespace
        this.props.onChange(ta.value);
        this.onSelectionChange(e.nativeEvent);
    }

    onSelectionChange(e: Event) {
        let ta: HTMLTextAreaElement = e.target as HTMLTextAreaElement;
        let do_spellcheck = this.props.spellcheck && !isInsideCodeBlock(ta);
        this.setState({ spellcheck: !!do_spellcheck });
    }

    // binded callbacks for memoization
    onhc = this.onHeightChange.bind(this);
    onku = this.onKeyUp.bind(this);
    onkd = this.onKeyDown.bind(this);
    onch = this.onChange.bind(this);

    render() {
        let { disabled, value, mobile, onBlur, onFocus, onContextMenu } = this.props,
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
                    value={value}
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