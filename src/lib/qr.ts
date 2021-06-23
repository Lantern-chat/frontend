import { formatRGB, rgb, RGBColor } from "./color";

// https://github.com/nayuki/QR-Code-generator/blob/master/typescript-javascript/qrcodegen.ts
// https://github.com/kennytm/qrcode-rust/blob/master/src/ec.rs

class SvgRenderer {
    svg: string;

    constructor(width: number, height: number, light: RGBColor, dark: RGBColor) {
        let light_formatted = formatRGB(light);
        let dark_formatted = formatRGB(dark);

        this.svg = `<?xml version="1.0" standalone="yes"?>
        <svg xmlns="http://www.w3.org/2000/svg"
         version="1.1" width="${width}" height="${height}"
         viewBox="0 0 ${width} ${height}" shape-rendering="crispEdges">
        <rect x="0" y="0" width="${width}" height="${height}" fill="${light_formatted}"/>
        <path fill="${dark_formatted}" d="`;
    }

    draw_dark_pixel(x: number, y: number) {
        this.draw_dark_rect(x, y, 1, 1);
    }

    draw_dark_rect(left: number, top: number, width: number, height: number) {
        this.svg += `M${left} ${top}h${width}v${height}H${left}V${top}`;
    }

    finish(): string {
        return this.svg + '"/></svg>';
    }
}

class Renderer {
    data: boolean[];
    modules_count: number;
    quiet_zone: number;
    module_size: { mw: number, mh: number };

    has_quiet_zone: boolean;

    constructor(data: boolean[], modules_count: number, quiet_zone: number) {
        this.data = data;
        this.module_size = { mw: 8, mh: 8 };
        this.has_quiet_zone = true;
        this.quiet_zone = quiet_zone;
        this.modules_count = modules_count;
    }

    render(light: RGBColor, dark: RGBColor): string {
        let w = this.modules_count,
            qz = this.quiet_zone,
            width = w + 2 * qz,
            { mw, mh } = this.module_size,
            real_width = width * mw,
            real_height = width * mh;

        let canvas = new SvgRenderer(real_width, real_height, light, dark);

        let i = 0;
        for(let y = 0; y < width; y++) {
            for(let x = 0; x < width; x++) {
                if(qz <= x && x < w + qz && qz <= y && y < w + qz) {
                    if(!this.data[i]) {
                        canvas.draw_dark_rect(x * mw, y * mh, mw, mh);
                    }
                    i += 1;
                }
            }
        }

        return canvas.finish();
    }
}