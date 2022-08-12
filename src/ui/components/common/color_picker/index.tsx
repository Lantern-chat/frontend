import { HSLColor, hsv, hsv2hsl, hsv2rgb, HSVColor, linear2u8, parseRgb, rgb2hsl, rgb2hsv, RGBColor, u82linear } from "lib/color";
import { createEffect, createMemo, createSignal } from "solid-js";
import { createRef } from "ui/hooks/createRef";

export interface IColorPickerProps {
    value: HSVColor,
    onChange?(color: HSVColor): void;

    onStartEdit?(): void;
    onEndEdit?(): void;
}

import "./color_picker.scss";

export function SaturationValuePicker(props: IColorPickerProps) {
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

    let hsl = createMemo(() => {
        let { h, s, l } = hsv2hsl(props.value);
        return `hsl(${h}, ${s * 100}%, ${l * 100}%)`;
    });

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

export function HuePicker(props: IColorPickerProps) {
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

export function ColorPicker(props: IColorPickerProps) {
    return (
        <div class="ln-color-picker">
            <div style={{ height: '10em' }}><SaturationValuePicker {...props} /></div>

            <div style={{ height: '2em' }}><HuePicker {...props} /></div>

            <RGBInput {...props} />

            {/* <div style={{ height: '10em' }}><HueSaturationPicker {...props} /></div> */}

        </div>
    );
}

function RGBInput(props: IColorPickerProps) {
    let rgb = createMemo(() => linear2u8(hsv2rgb(props.value)));
    let hex = () => {
        let { r, g, b } = rgb(), crgb = [r, g, b];
        return '#' + crgb.map(c => c.toString(16).padStart(2, '0')).join('');
    };

    let on_change = (rgb: RGBColor) => props.onChange?.(rgb2hsv(u82linear(rgb)));

    let on_rgb_value = (w: 'r' | 'g' | 'b', value: string) => {
        let c = rgb();
        c[w] = Math.max(0, Math.min(255, parseInt('0' + value, 10)));
        on_change(c);
    }

    let on_rgb_input = (e: InputEvent) => {
        let i = e.currentTarget as HTMLInputElement;
        on_rgb_value(i.parentElement!.id as any, i.value);
    };

    let on_scroll = (e: WheelEvent) => {
        let i = e.currentTarget as HTMLInputElement;
        let c = rgb();
        c[i.parentElement!.id] += e.deltaY < 0 ? 1 : -1;
        on_change(c);
        e.preventDefault();
    };

    let on_hex_input = (e: InputEvent) => {
        on_change(parseRgb((e.currentTarget as HTMLInputElement).value));
    };

    let select_all = (e: MouseEvent) => {
        (e.currentTarget as HTMLInputElement).select();
    };

    return (
        <div class="rgb_input">
            <span id="r">R<input pattern="^\\d{0,3}$" type="text" value={rgb().r.toFixed(0).padStart(3, '0')} placeholder="128" onInput={on_rgb_input} onWheel={on_scroll} onClick={select_all} /></span>
            <span id="g">G<input pattern="^\\d{0,3}$" type="text" value={rgb().g.toFixed(0).padStart(3, '0')} placeholder="128" onInput={on_rgb_input} onWheel={on_scroll} onClick={select_all} /></span>
            <span id="b">B<input pattern="^\\d{0,3}$" type="text" value={rgb().b.toFixed(0).padStart(3, '0')} placeholder="128" onInput={on_rgb_input} onWheel={on_scroll} onClick={select_all} /></span>
            <span><input pattern="^#?\\d{6}$" id="h" type="text" placeholder="#000000" value={hex()} onInput={on_hex_input} onClick={select_all} /></span>
        </div>
    )
}