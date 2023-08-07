import { createMemo } from "solid-js";

import { QrCode as Encoder, Ecc } from "lib/qr";
export { Ecc } from "lib/qr";

import { RGBColor, formatRGB, rgb } from "lib/color";

export interface QrCodeProps {
    value: string,
    ecc?: Ecc,
    light?: RGBColor,
    dark?: RGBColor,
}

export function QrCode(props: QrCodeProps) {
    let src = createMemo(() => {
        let qr = Encoder.encodeText(props.value, props.ecc || Ecc.MEDIUM), s = qr.size;

        let light_formatted = formatRGB(props.light || rgb(1, 1, 1)),
            dark_formatted = formatRGB(props.dark || rgb(0, 0, 0));

        let svg = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" \
            width="${s}" height="${s}" viewBox="0 0 ${s} ${s}" shape-rendering="crispEdges">\
                <rect x="0" y="0" width="${s}" height="${s}" fill="var(--qr-light, ${light_formatted})"/>\
                <path fill="var(--qr-dark, ${dark_formatted})" d="`;

        for(let y = 0; y < s; y++) {
            for(let x = 0; x < s; x++) {
                if(qr.getModule(x, y)) {
                    svg += `M${x} ${y}h1v1H${x}V${y}`;
                }
            }
        }

        return svg + '"/></svg>';
    });

    return (<div class="ln-qr-code" innerHTML={src()} />);
}