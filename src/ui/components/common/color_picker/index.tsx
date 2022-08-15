import { Color, HSLColor, hsv, hsv2hsl, hsv2rgb, HSVColor, float2u8, parseRgb, rgb2hsl, rgb2hsv, RGBColor, u82float } from "lib/color";
import { createEffect, createMemo, createRenderEffect, createSignal, splitProps } from "solid-js";
import { createRef } from "ui/hooks/createRef";

export interface IColorPickerProps<C extends Color> {
    value: C,
    onChange?(color: C): void;

    onStartEdit?(): void;
    onEndEdit?(): void;
}

import "./color_picker.scss";

export function SaturationValuePicker(props: IColorPickerProps<HSVColor>) {
    let controller = createRef<HTMLDivElement>();

    let [moving, setMoving] = createSignal(false);

    createEffect(() => moving() ? props.onStartEdit?.() : props.onEndEdit?.());

    let compute = (x: number, y: number) => {
        let rect = controller.current!.getBoundingClientRect();
        x = Math.min(1, Math.max(0, (x - rect.left) / rect.width));
        y = Math.min(1, Math.max(0, (y - rect.top) / rect.height));

        props.onChange?.({ h: props.value.h, s: x, v: 1 - y });
    };

    let onMouse = (e: MouseEvent) => {
        if(!(e.buttons & 1)) {
            setMoving(false);
            return;
        }

        compute(e.clientX, e.clientY);
        e.preventDefault();
    };

    let onTouch = (e: TouchEvent) => {
        let touch = e.touches[0];
        compute(touch.clientX, touch.clientY);
        e.preventDefault();
    };

    let hsl = () => {
        let { h, s, l } = hsv2hsl(props.value);
        return `hsl(${h}, ${s * 100}%, ${l * 100}%)`;
    };

    let stop_edit = (e: MouseEvent) => { setMoving(false); onMouse(e); };

    return (
        <div class="ln-2d-sat-value-picker"
            onMouseMove={e => moving() && onMouse(e)}
            onMouseUp={stop_edit}
            onMouseLeave={stop_edit}
            onTouchMove={onTouch}
            style={{ cursor: moving() ? 'grabbing' : 'pointer' }}
        >
            <div class="sl-controller"
                ref={controller}
                onMouseDown={e => { setMoving(true); onMouse(e) }}
                onTouchStart={onTouch}
            >
                <div class="hsv">
                    <div class="hue" style={{ 'background-color': `hsl(${props.value.h}, 100%, 50%)` }} />
                    <div class="saturation" />
                    <div class="value" />
                </div>
                <div class="sl-cursor" style={{
                    left: props.value.s * 100 + '%',
                    bottom: props.value.v * 100 + '%',
                    cursor: moving() ? 'grabbing' : 'grab'
                }}>
                    <div><span style={{ 'background-color': hsl() }} /></div>
                </div>
            </div>
        </div>
    )
}

export function HuePicker(props: IColorPickerProps<HSVColor>) {
    let controller = createRef<HTMLDivElement>();
    let [moving, setMoving] = createSignal(false);

    createEffect(() => moving() ? props.onStartEdit?.() : props.onEndEdit?.());

    let compute = (x: number) => {
        let rect = controller.current!.getBoundingClientRect();
        x = Math.min(1, Math.max(0, (x - rect.left) / rect.width));

        props.onChange?.({ h: x * 360, s: props.value.s, v: props.value.v });
    };

    let onTouch = (e: TouchEvent) => {
        let touch = e.touches[0];
        compute(touch.clientX);
        e.preventDefault();
    };

    let onMouse = (e: MouseEvent) => {
        if(!(e.buttons & 1)) {
            setMoving(false);
            return;
        }

        compute(e.clientX);
        e.preventDefault();
    };

    let stop_edit = (e: MouseEvent) => { setMoving(false); onMouse(e); };

    return (
        <div class="ln-linear-hue-picker"
            onMouseMove={e => moving() && onMouse(e)}
            onMouseUp={stop_edit}
            onMouseLeave={stop_edit}
            onTouchMove={onTouch}
            style={{ cursor: moving() ? 'grabbing' : 'pointer' }}
        >
            <div class="h-controller" ref={controller}
                onMouseDown={e => { setMoving(true); onMouse(e) }}
                onTouchStart={onTouch}
            >
                <div class="h-cursor" style={{
                    left: (props.value.h / 360 * 100) + '%',
                    cursor: moving() ? 'grabbing' : 'grab'
                }}>
                    <div><span style={{ 'background-color': `hsl(${props.value.h}, 100%, 50%)` }} /></div>
                </div>
            </div>
        </div>
    )
}

/*
export function HueSaturationPicker(props: IColorPickerProps) {
    let controller = createRef<HTMLDivElement>();

    let compute = (x: number, y: number) => {
        let rect = controller.current!.getBoundingClientRect();

        let cx = 0.5 * (rect.left + rect.right);
        let cy = 0.5 * (rect.top + rect.bottom);

        x -= cx;
        y -= cy;

        console.log(x, y);

        let saturation = Math.hypot(x, y) / (0.5 * rect.width);
        let hue = (180 + Math.atan2(y, x) * 180.0 / Math.PI) % 360;

        props.onChange?.({ h: hue, s: saturation, v: props.value.v });
    };

    let onMouse = (e: MouseEvent) => {
        compute(e.clientX, e.clientY);
    };

    let lightness = createMemo(() => hsv2hsl(props.value).l);

    return (
        <div class="ln-hue-sat-picker">
            <div class="hs-controller" ref={controller}>
                <div class="hsl" onMouseDown={onMouse}>
                    <div class="hue" />
                    <div class="saturation" />
                    <div class="lightness" style={{
                        'background-color': lightness() < 0.5 ? 'black' : 'white',
                        opacity: Math.abs(lightness() - 0.5) * 2,
                    }} />
                </div>
            </div>
        </div>
    )
}
*/

export function ColorPicker(props: IColorPickerProps<RGBColor>) {
    // RGB Values suck, and can reset the hue when they reach black/white/edges of the editor
    // So below we track HSV separately, and only update it from the RGB value if the update
    // coming through isn't just controlled feedback from the HSV value.

    let [hsv, setHsv] = createSignal(rgb2hsv(props.value));

    let hsv_changes = 1;

    let update_hsv = (hsv: HSVColor) => {
        hsv_changes = 0;
        setHsv(hsv);
        props.onChange?.(hsv2rgb(hsv));
    };

    createRenderEffect(() => {
        let rgb = props.value;
        if(hsv_changes > 0) {
            setHsv(rgb2hsv(rgb));
        } else {
            hsv_changes++;
        }
    });

    let [hsv_props] = splitProps(props, ['onStartEdit', 'onEndEdit']);

    return (
        <div class="ln-color-picker">
            <div style={{ height: '10em' }}><SaturationValuePicker {...hsv_props} value={hsv()} onChange={update_hsv} /></div>

            <div style={{ height: '2em' }}><HuePicker {...hsv_props} value={hsv()} onChange={update_hsv} /></div>

            <RGBInput {...props} />
        </div>
    );
}

function RGBInput(props: IColorPickerProps<RGBColor>) {
    let rgb = createMemo(() => float2u8(props.value));
    let hex = () => {
        let { r, g, b } = rgb();
        return '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('').toUpperCase();
    };

    let on_change = (rgb: RGBColor) => props.onChange?.(u82float(rgb));

    let on_rgb_value = (w: 'r' | 'g' | 'b', value: string) => {
        let c = rgb();
        c[w] = Math.max(0, Math.min(255, parseInt('0' + value, 10)));
        on_change(c);
    };

    let timer: number;

    let on_rgb_input = (e: InputEvent) => {
        clearTimeout(timer);
        props.onStartEdit?.();

        let i = e.currentTarget as HTMLInputElement;
        on_rgb_value(i.parentElement!.id as any, i.value);

        timer = setTimeout(() => props.onEndEdit?.(), 1000);
    };

    let on_scroll = (e: WheelEvent) => {
        e.preventDefault();

        clearTimeout(timer);
        props.onStartEdit?.();

        let i = e.currentTarget as HTMLInputElement;
        let c = rgb(), k = i.parentElement!.id;
        c[k] = Math.max(0, Math.min(255, c[k] + (e.deltaY < 0 ? 1 : -1)));
        on_change(c);

        timer = setTimeout(() => props.onEndEdit?.(), 500);
    };

    let on_hex_input = (e: InputEvent) => {
        clearTimeout(timer);
        props.onStartEdit?.();

        on_change(parseRgb((e.currentTarget as HTMLInputElement).value));

        timer = setTimeout(() => props.onEndEdit?.(), 1000);
    };

    let select_all = (e: MouseEvent) => (e.currentTarget as HTMLInputElement).select();

    return (
        <div class="rgb_input">
            <span id="r">R<input pattern="^\\d{0,3}$" type="text" value={rgb().r.toFixed(0).padStart(3, '0')} placeholder="128" onInput={on_rgb_input} onWheel={on_scroll} onClick={select_all} /></span>
            <span id="g">G<input pattern="^\\d{0,3}$" type="text" value={rgb().g.toFixed(0).padStart(3, '0')} placeholder="128" onInput={on_rgb_input} onWheel={on_scroll} onClick={select_all} /></span>
            <span id="b">B<input pattern="^\\d{0,3}$" type="text" value={rgb().b.toFixed(0).padStart(3, '0')} placeholder="128" onInput={on_rgb_input} onWheel={on_scroll} onClick={select_all} /></span>
            <span><input pattern="^#?\\d{6}$" id="h" type="text" placeholder="#000000" value={hex()} onInput={on_hex_input} onClick={select_all} /></span>
        </div>
    )
}