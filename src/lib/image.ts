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

export async function resize_image(url: string, width: number, height: number, lossy: boolean = false): Promise<Blob | null> {
    let img = new Image();
    img.src = url;

    let decoding = img.decode(), canvas = document.createElement('canvas')

    canvas.width = width;
    canvas.height = height;

    try {
        let ctx = canvas.getContext('2d');

        if(!ctx) {
            return null;
        }

        let format = () => (!lossy || has_alpha(ctx!)) ? 'image/png' : 'image/jpeg';

        if(typeof window.createImageBitmap === 'function') {
            await decoding;

            let bitmap;

            // no need to resize, just re-encode
            if(img.naturalWidth <= width && img.naturalHeight <= height) {
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;

                bitmap = img;
            } else {
                // TODO: cropping
                bitmap = await createImageBitmap(img, {
                    resizeHeight: height,
                    resizeWidth: width,
                    resizeQuality: 'high',
                });
            }

            ctx.drawImage(bitmap, 0, 0);

            let blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, format(), 95));

            // if builtin image encoding fails, this will continue on to try using pica
            if(blob) {
                return blob;
            }
        }

        let [{ default: pica }] = await Promise.all([import('pica'), decoding]);

        let p = new pica();

        // TODO: Cropping
        let res = await p.resize(img, canvas);
        return p.toBlob(res, format(), 95);

    } finally {
        img.remove();
        canvas.remove();
    }
}