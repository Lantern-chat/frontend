export interface SpinnerProps {
    size?: number | string,
}

export function makeSpinnerStyle(props: SpinnerProps) {
    let size = props.size || 80;
    if(typeof size === 'string' && size.includes('em')) {
        return { width: '1em', height: '1em', fontSize: size };
    }
    return { width: size, height: size };
}
