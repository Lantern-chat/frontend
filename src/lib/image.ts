function has_alpha(ctx: CanvasRenderingContext2D): boolean {
    let data = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    if(data) {
        let pixels = data.data;

        for(let i = 0; i < pixels.length; i += 4) {
            if(pixels[i + 3] < 255) {
                return true;
            }
        }
    }
    return false;
}

interface CropRect {
    x: number,
    y: number,
    w: number,
    h: number,
}

function compute_crop(width: number, height: number, max_width: number, max_height: number): CropRect {
    if(max_width == max_height) {
        if(width != height) {
            let x = 0;
            let y = 0;
            let w = width;
            let h = height;

            if(width > height) {
                x = (width - height) / 2;
                w = height;
            } else {
                y = (height - width) / 2;
                h = width;
            }

            return { x, y, w, h };
        }
    } else {
        let desired_aspect = max_width / max_height;
        let actual_aspect = width / height;
        let aspect_diff = desired_aspect - actual_aspect;

        if(Math.abs(aspect_diff) > 0.01) {
            let x = 0;
            let w = width;
            let h = height;

            if(aspect_diff > 0.0) {
                h = width / desired_aspect;
            } else {
                w = height * desired_aspect;
                x = (width - w) / 2; // center horizontally
            }

            return { x, w, h, y: 0 };
        }
    }
    return { x: 0, y: 0, h: height, w: width };
}

export async function resize_image(url: string, width: number, height: number, lossy: boolean = false): Promise<Blob | undefined> {
    let img = new Image();
    img.src = url;

    let decoding = img.decode(),
        src: HTMLCanvasElement | HTMLImageElement = document.createElement('canvas'),
        dst = document.createElement('canvas');

    try {
        let [{ default: pica }] = await Promise.all([import('pica'), decoding]),
            p = new pica();

        let nw = img.naturalWidth, nh = img.naturalHeight,
            { x, y, w, h } = compute_crop(nw, nh, width, height),
            dw = Math.min(w, width), dh = Math.min(h, height),
            needs_crop = (x + y) > 0 || w != nw || h != nh,
            needs_resize = dw >= width || dh >= height;

        if(!needs_crop && !needs_resize) {
            return;
        }

        __DEV__ && console.log("Resizing to: ", x, y, w, h, dw, dh);

        if(needs_crop) {
            src.width = w;
            src.height = h;

            let ctx = src.getContext('2d');
            if(!ctx) { return; }

            ctx.drawImage(img, x, y, w, h, 0, 0, w, h);

            img.remove(); // free memory after cropping
        } else {
            src = img;
        }

        if(needs_resize) {
            dst.width = dw;
            dst.height = dh;

            await p.resize(src, dst);

            src.remove(); // try to free up memory before encode
        } else {
            dst = src as HTMLCanvasElement;
        }

        let ctx = dst.getContext('2d');
        if(!ctx) return;

        let format = (!lossy || has_alpha(ctx)) ? 'image/png' : 'image/jpeg';
        return p.toBlob(dst, format, 95);

    } finally {
        img.remove();
        src.remove();
        dst.remove();
    }
}