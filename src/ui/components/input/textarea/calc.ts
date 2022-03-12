import { SizingData } from "./sizing";

export type CalculatedNodeHeights = number[];

let hiddenTextarea: HTMLTextAreaElement | null = null;

const HIDDEN_TEXTAREA_STYLE = {
    'min-height': '0',
    'max-height': 'none',
    height: '0',
    visibility: 'hidden',
    overflow: 'hidden',
    position: 'absolute',
    'z-index': '-1000',
    top: '0',
    right: '0',
} as const;

function forceHiddenStyles(node: HTMLElement) {
    Object.keys(HIDDEN_TEXTAREA_STYLE).forEach((key) => {
        node.style.setProperty(
            key,
            HIDDEN_TEXTAREA_STYLE[key as keyof typeof HIDDEN_TEXTAREA_STYLE],
            'important',
        );
    });
};

export function getHeight(node: HTMLElement, sizingData: SizingData): number {
    let height = node.scrollHeight;

    if(sizingData.sizingStyle.boxSizing === 'border-box') {
        return height + sizingData.borderSize;
    }

    return height - sizingData.paddingSize;
}

export function calculateNodeHeight(
    sizingData: SizingData,
    value: string,
    minRows = 1,
    maxRows = Infinity,
): CalculatedNodeHeights {
    if(!hiddenTextarea) {
        hiddenTextarea = document.createElement('textarea');
        hiddenTextarea.setAttribute('tabindex', '-1');
        hiddenTextarea.setAttribute('aria-hidden', 'true');
        forceHiddenStyles(hiddenTextarea);
    }

    if(hiddenTextarea.parentElement === null) {
        document.body.appendChild(hiddenTextarea);
    }

    let { paddingSize, borderSize, sizingStyle } = sizingData, { boxSizing } = sizingStyle;

    Object.keys(sizingStyle).forEach((_key) => {
        const key = _key as keyof typeof sizingStyle;
        hiddenTextarea!.style[key] = sizingStyle[key] as any;
    });

    forceHiddenStyles(hiddenTextarea);

    hiddenTextarea.value = value;
    let height = getHeight(hiddenTextarea, sizingData);

    // measure height of a textarea with a single row
    hiddenTextarea.value = 'x';
    const rowHeight = hiddenTextarea.scrollHeight - paddingSize;

    let minHeight = rowHeight * minRows;
    if(boxSizing === 'border-box') {
        minHeight = minHeight + paddingSize + borderSize;
    }
    height = Math.max(minHeight, height);

    let maxHeight = rowHeight * maxRows;
    if(boxSizing === 'border-box') {
        maxHeight = maxHeight + paddingSize + borderSize;
    }
    height = Math.min(maxHeight, height);

    return [height, rowHeight];
}