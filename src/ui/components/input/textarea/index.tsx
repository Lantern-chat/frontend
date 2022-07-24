import { createEffect, createMemo, createRenderEffect, createSignal, JSX, onCleanup, onMount, splitProps } from "solid-js";

import { AnyRef, composeRefs } from "ui/hooks/createRef";
import { px } from "ui/utils";
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
    let [local, taprops] = splitProps(props, ['maxRows', 'minRows', 'onHeightChange', 'cacheMeasurements', 'ta', 'ref', 'onInput', 'onChange', 'style'])

    let ref = composeRefs(local.ta, local.ref), measurements: SizingData;

    let [height, setHeight] = createSignal(0);

    let resizeTextarea = () => {
        let node = ref.current;
        if(node) {
            let nodeSizingData = local.cacheMeasurements && measurements ? measurements : getSizingData(node);

            if(nodeSizingData) {
                measurements = nodeSizingData;
                let value = node.value || node.placeholder || 'x';

                let [new_height, rowHeight] = calculateNodeHeight(
                    nodeSizingData,
                    value,
                    local.minRows,
                    local.maxRows
                );

                if(height() !== new_height) {
                    setHeight(new_height);
                    local.onHeightChange?.(height(), { rowHeight });
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

    let onChange = (event: Event) => { (local.onChange as any)?.(event); uncontrolled_resize(); };
    let onInput = (event: InputEvent) => { (local.onInput as any)?.(event); uncontrolled_resize(); };

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
    queueMicrotask(resizeTextarea);

    return (
        <textarea {...taprops} ref={ref}
            onInput={onInput} onChange={onChange}
            style={{ ...local.style, height: px(height()) }} value={props.value} />
    );
}