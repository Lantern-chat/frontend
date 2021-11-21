import React, { useState, useCallback, useEffect, useRef, useLayoutEffect, forwardRef, useContext, useMemo } from "react";

import { useDispatch, useSelector } from "react-redux";
import { createSelector, createStructuredSelector } from "reselect";

import TextareaAutosize, { TextareaHeightChangeMeta } from 'react-textarea-autosize';

import { RootState } from "state/root";

import { useForceRender } from "ui/hooks/useForceRender";
import { parseHotkey, Hotkey, MainContext } from "ui/hooks/useMainClick";

export interface IMsgTextareaProps {
    disabled?: boolean,
    value: string,

    onChange(value: string): void;
    onBlur(): void;
    onFocus(): void;
    onChange(value: string): void;
    onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>): void;
}

import "./textarea.scss";
export const MsgTextarea = React.memo(forwardRef((props: IMsgTextareaProps, ref: React.MutableRefObject<HTMLTextAreaElement>) => {
    let { disabled } = props;

    let use_mobile_view = useSelector((state: RootState) => state.window.use_mobile_view),
        main = useContext(MainContext),
        value = useRef<string>(props.value),
        forceRender = useForceRender();

    useLayoutEffect(() => {
        value.current = props.value;
        forceRender();
    }, [props.value]);

    let on_keyup = useCallback((e: React.KeyboardEvent) => {
        let hotkey = parseHotkey(e.nativeEvent);
        if(hotkey == null || hotkey == Hotkey.FocusTextArea) {
            // not-hotkeys shouldn't escape, to save on processing time of keypress
            // or if the textarea is already focused, don't refocus
            e.stopPropagation();
        }
    }, []);

    let [rows, setRows] = useState(1);
    let onHeightChange = useCallback((height: number, { rowHeight }: TextareaHeightChangeMeta) => {
        setRows(Math.floor(height / rowHeight));
    }, []);

    let on_keydown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        // filter events
        if(onKeydown(e, use_mobile_view, value)) {
            props.onKeyDown(e);
        }
    }, [use_mobile_view]);

    let on_change = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        value.current = e.currentTarget.value.replace(/^\n+/, '');
        props.onChange(value.current);
        forceRender();
    }, []);

    let on_cm = useCallback((e: React.MouseEvent) => {
        main.clickAll(e);
        e.stopPropagation();
    }, []);

    let { style, max_rows } = useMemo(() => {
        let style, max_rows = use_mobile_view ? 5 : 20;

        if(rows < max_rows) {
            style = { overflowY: 'hidden' };
        }

        return { style, max_rows };
    }, [use_mobile_view, rows]);

    return (
        <div className="ln-msg-textarea">
            {disabled ? <span className="ln-msg-textarea__disable"></span> : null}

            <TextareaAutosize disabled={disabled}
                onBlur={props.onBlur}
                onFocus={props.onFocus}
                cacheMeasurements={false}
                ref={ref}
                placeholder="Message..."
                rows={1} maxRows={max_rows} style={style as any}
                value={value.current}
                onKeyDown={on_keydown} onChange={on_change} onKeyUp={on_keyup}
                onContextMenu={on_cm}
                onHeightChange={onHeightChange}
            />
        </div>
    );
}));

function onKeydown(e: React.KeyboardEvent<HTMLTextAreaElement>, use_mobile_view: boolean, value: React.MutableRefObject<string>): boolean {
    let ta = e.currentTarget;

    let isInsideCodeblock = () => {
        let cursor = ta.selectionStart;

        // check if the cursor is inside a code block, in which case allow plain newlines
        let prev = { index: 0 }, delim, re = /`{3}/g, inside = false;
        for(let idx = 0; delim = re.exec(value.current); idx++) {
            if(prev.index <= cursor && cursor > delim.index) {
                inside = !inside;
            }
            prev = delim;
        }

        return inside;
    };

    let stop_prop = true;

    switch(e.key) {
        case 'Enter': {
            if(use_mobile_view || e.shiftKey || value.current.length == 0 || isInsideCodeblock()) return false;

            e.preventDefault();

            // do_send() done above

            break;
        }
        case 'Tab': {
            if(e.shiftKey || isInsideCodeblock()) {
                value.current += '\t';

                // TODO: Test if this is done automatically
                //ta.value = value.current;
            }

            e.preventDefault();

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

    return true;
}