import pica from 'pica'
interface LoadedImage {
    image: HTMLImageElement;
    width: number;
    height: number;
}

const imageLoader = (file: File) => {
    return new Promise<LoadedImage>((resolve, reject) => {
        const image = new Image();
        image.crossOrigin = "Anonymous";
        image.onerror = (err) => reject(err);
        image.onload = (e) => {
            const { width, height } = e.target as HTMLImageElement;
            const resizeWidth = 800;
            const resizeHeight = (resizeWidth * height) / width;
            resolve({
                image,
                width: resizeWidth,
                height: resizeHeight,
            });
        };

        const reader = new FileReader();
        reader.onerror = (err) => reject(err);
        reader.onload = () => {
            image.src = reader.result as string;
        };
        reader.readAsDataURL(file);
    });
};

export const imageResizer = async (file: File) => {
    const resizer = new pica();
    return new Promise<Blob>((resolve, reject) => {
        imageLoader(file).then(({ image, width, height }) => {
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            resizer
                .resize(image, canvas)
                .then((result) => resizer.toBlob(result, "image/png"))
                .then((blob) => {
                    resolve(blob);
                    canvas.remove();
                    image.remove();
                })
                .catch((err) => reject(err));
        });
    });
};
