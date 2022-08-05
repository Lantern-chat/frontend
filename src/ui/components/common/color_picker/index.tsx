import { HSLColor, hsv, hsv2hsl, HSVColor, rgb2hsl, RGBColor } from "lib/color";
import { createEffect, createMemo, createSignal } from "solid-js";
import { createRef } from "ui/hooks/createRef";

export interface IColorPickerProps {
    value: HSVColor,
    onChange?(color: HSVColor): void;
}

import "./color_picker.scss";

export function SaturationValuePicker(props: IColorPickerProps) {
    let controller = createRef<HTMLDivElement>();

    let [moving, setMoving] = createSignal(false);

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

    return (
        <div class="ln-2d-sat-value-picker"
            onMouseMove={e => moving() && onMouse(e)}
            onMouseUp={e => { setMoving(false); onMouse(e); }}
            onTouchMove={onTouch}
            style={{ cursor: moving() ? 'grabbing' : void 0 }}
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

    return (
        <div class="ln-linear-hue-picker"
            onMouseMove={e => moving() && onMouse(e)}
            onMouseUp={e => { setMoving(false); onMouse(e); }}
            onTouchMove={onTouch}
            style={{ cursor: moving() ? 'grabbing' : void 0 }}
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

        console.log("Hue", hue, "Saturation", saturation);

        props.onChange?.({ h: hue, s: saturation, v: props.value.v });
    };

    let onMouse = (e: MouseEvent) => {
        compute(e.clientX, e.clientY);
    };

    let lightness = createMemo(() => hsv2hsl(props.value).l);

    createEffect(() => {
        console.log("Lightness", lightness());
    })

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
    let hsl = createMemo(() => {
        let { h, s, l } = hsv2hsl(props.value);
        return `hsl(${h}, ${s * 100}%, ${l * 100}%)`;
    });

    return (
        <>
            <div style={{ width: '100%', height: '3em', "background-color": hsl() }}>

            </div>
            <div class="ln-color-picker">
                <div style={{ height: '10em' }}><SaturationValuePicker {...props} /></div>

                <div style={{ height: '2em' }}><HuePicker {...props} /></div>

                {/* <div style={{ height: '10em' }}><HueSaturationPicker {...props} /></div> */}

            </div>

        </>
    );
}