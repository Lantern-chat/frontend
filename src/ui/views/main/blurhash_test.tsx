import { decode as decode_z85 } from "lib/base85";
import { decode as decode_blurhash } from "lib/blurhash";
import { useEffect, useRef } from "react";

const DATA: string = "p.fR0Xb+k2{6$4n&rVO2}vsRT0sqBq?4xz)&r(dYdgLXJt[xyqgY#XzsRcC}[dv+(b[d*a]a08M?X5l?IW9=8km4w$}Wm(XU(>dn-sZf6Kp.N3-$v8s3j?.5*x-MtCO7q]EHs*woB#).*x+.9-sYY?X^z*R)G?$-ujZlMjpJblz3]5gA$CR?uj:1w1o)V)@13NJ^*IMG]a2Ky?WPR^";

export default function BlurhashTest() {
    let ref = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if(ref && ref.current) {
            let canvas = ref.current;
            let ctx = canvas.getContext('2d');

            if(ctx) {
                let t = new TextEncoder();
                let utf8 = t.encode(DATA);
                let bytes = decode_z85(utf8);
                let pixels = decode_blurhash(bytes, canvas.width, canvas.height, 1.4);
                let img_data = new ImageData(pixels, canvas.width, canvas.height);
                ctx.putImageData(img_data, 0, 0);
            }
        }


    }, [ref]);

    return (
        <div>
            <canvas ref={ref} width={100} height={100} />
            <img src="https://derpicdn.net/img/view/2015/1/17/808592.png" width={100} height={100} />
        </div>
    );
}