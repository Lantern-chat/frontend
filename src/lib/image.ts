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

export async function resize_image(url: string, width: number, height: number, lossy: boolean = false): Promise<Blob | null> {
    let img = new Image();
    img.src = url;

    let decoding = img.decode(), canvas = document.createElement('canvas')

    try {
        let ctx = canvas.getContext('2d');

        if(!ctx) { return null; }

        await decoding;

        let { x, y, w, h } = compute_crop(img.naturalWidth, img.naturalHeight, width, height),
            dw = Math.min(w, width), dh = Math.min(h, height);

        __DEV__ && console.log("Cropping to: ", x, y, w, h, dw, dh);

        canvas.width = dw;
        canvas.height = dh;

        if(typeof window.createImageBitmap === 'function') {
            let bitmap = await createImageBitmap(img, x, y, w, h, {
                resizeHeight: dh,
                resizeWidth: dw,
                resizeQuality: 'high',
            });

            ctx.drawImage(bitmap, 0, 0);
        } else {
            ctx.drawImage(img, x, y, w, h, 0, 0, dw, dh);
        }

        return await new Promise(resolve => {
            let format = (!lossy || has_alpha(ctx!)) ? 'image/png' : 'image/jpeg';
            canvas.toBlob(resolve, format, 95);
        });
    } finally {
        img.remove();
        canvas.remove();
    }
}