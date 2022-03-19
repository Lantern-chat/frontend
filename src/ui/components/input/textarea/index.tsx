import { createEffect, createMemo, createRenderEffect, JSX, mergeProps, onCleanup, onMount, splitProps } from "solid-js";
import { createMicrotask } from "ui/hooks/createMicrotask";

import { AnyRef, composeRefs } from "ui/hooks/createRef";
import { calculateNodeHeight } from "./calc";

import { getSizingData, SizingData } from "./sizing";

export type TextareaProps = JSX.TextareaHTMLAttributes<HTMLTextAreaElement>;

export type Style = Omit<
    NonNullable<TextareaProps['style']>,
    'maxHeight' | 'minHeight' | 'height'
>;

export type TextareaHeightChangeMeta = {
    rowHeight: number;
};

export interface TextareaAutosizeProps extends Omit<TextareaProps, 'style'> {
    maxRows?: number;
    minRows?: number;
    onHeightChange?: (height: number, meta: TextareaHeightChangeMeta) => void;
    cacheMeasurements?: boolean;
    style?: Partial<Style>;
    ta?: AnyRef<HTMLTextAreaElement>,
    ref?: AnyRef<HTMLTextAreaElement>,
}

export function TextareaAutosize(props: TextareaAutosizeProps) {
    let [local, taprops] = splitProps(props, ['maxRows', 'minRows', 'onHeightChange', 'cacheMeasurements', 'ta', 'ref', 'onInput', 'onChange'])

    let ref = composeRefs(local.ta, local.ref), height = 0, measurements: SizingData;

    let resizeTextarea = () => {
        let node = ref.current;
        if(node) {
            let nodeSizingData = local.cacheMeasurements && measurements ? measurements : getSizingData(node);

            if(nodeSizingData) {
                measurements = nodeSizingData;

                let [new_height, rowHeight] = calculateNodeHeight(
                    nodeSizingData,
                    node.value || node.placeholder || 'x',
                    local.minRows,
                    local.maxRows
                );

                if(height !== new_height) {
                    height = new_height;
                    node.style.setProperty('height', `${height}px`, 'important');
                    local.onHeightChange?.(height, { rowHeight });
                }
            }
        }
    };

    let uncontrolled_resize = () => {
        // not controlled
        if(taprops.value === undefined) {
            resizeTextarea();
        }
    };

    let onChange = (event: Event) => {
        uncontrolled_resize();
        (local.onChange as any)?.(event);
    };

    let onInput = (event: InputEvent) => {
        uncontrolled_resize();
        (local.onInput as any)?.(event);
    };

    onMount(() => {
        window.addEventListener('resize', resizeTextarea);
        onCleanup(() => window.removeEventListener('resize', resizeTextarea));
    });

    // TODO: Replace this with mutation observers?
    // https://stackoverflow.com/questions/3219758/detect-changes-in-the-dom

    // access text-area props to make this effect dependent on them
    createRenderEffect(() => {
        ({ ...taprops });
        resizeTextarea();
    });

    // queue off resize before paint
    createMicrotask(resizeTextarea);

    return (
        <textarea {...taprops} onInput={onInput} onChange={onChange} ref={ref} />
    );
}