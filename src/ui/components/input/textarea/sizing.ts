const SIZING_STYLE = [
    'borderBottomWidth',
    'borderLeftWidth',
    'borderRightWidth',
    'borderTopWidth',
    'boxSizing',
    'fontFamily',
    'fontSize',
    'fontStyle',
    'fontWeight',
    'letterSpacing',
    'lineHeight',
    'paddingBottom',
    'paddingLeft',
    'paddingRight',
    'paddingTop',
    // non-standard
    'tabSize',
    'textIndent',
    // non-standard
    'textRendering',
    'textTransform',
    'width',
    'wordBreak',
] as const;

type SizingProps = Extract<
    typeof SIZING_STYLE[number],
    keyof CSSStyleDeclaration
>;

type SizingStyle = Pick<CSSStyleDeclaration, SizingProps>;

export type SizingData = {
    sizingStyle: SizingStyle;
    paddingSize: number;
    borderSize: number;
};

const isIE = typeof document !== 'undefined' ? !!(document.documentElement as any).currentStyle : false;

export const pick = <Obj extends { [key: string]: any }, Key extends keyof Obj>(
    props: Key[],
    obj: Obj,
): Pick<Obj, Key> => props.reduce((acc, prop) => (acc[prop] = obj[prop], acc), {} as Pick<Obj, Key>);

export function getSizingData(node: HTMLElement): SizingData | null {
    let style = window.getComputedStyle(node);

    if(style === null) {
        return null;
    }

    let sizingStyle = pick((SIZING_STYLE as unknown) as SizingProps[], style), { boxSizing } = sizingStyle;

    // probably node is detached from DOM, can't read computed dimensions
    if(boxSizing === '') {
        return null;
    }

    // IE (Edge has already correct behaviour) returns content width as computed width
    // so we need to add manually padding and border widths
    if(isIE && boxSizing === 'border-box') {
        sizingStyle.width =
            parseFloat(sizingStyle.width!) +
            parseFloat(sizingStyle.borderRightWidth!) +
            parseFloat(sizingStyle.borderLeftWidth!) +
            parseFloat(sizingStyle.paddingRight!) +
            parseFloat(sizingStyle.paddingLeft!) +
            'px';
    }

    const paddingSize =
        parseFloat(sizingStyle.paddingBottom!) +
        parseFloat(sizingStyle.paddingTop!);

    const borderSize =
        parseFloat(sizingStyle.borderBottomWidth!) +
        parseFloat(sizingStyle.borderTopWidth!);

    return {
        sizingStyle,
        paddingSize,
        borderSize,
    };
}