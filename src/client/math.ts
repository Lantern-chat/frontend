const { sqrt, cbrt, sin, abs, sign, PI, min, max } = Math;

export function saturate(x: number): number {
    return min(1, max(0, x));
}

export function smoothstep(x: number): number {
    if(x <= 0) return 0;
    if(x >= 1) return 1;

    let x2 = x * x;
    let x3 = x2 * x;

    return 6 * x3 * x2 - 15 * x2 * x2 + 10 * x3;
}

export function squine3(x0: number): number {
    let quad = (x: number) => (1 + cbrt(x * x * x - 1));
    let semi = (x: number) => (x <= 1 ? quad(x) : (2 - quad(-x + 2)));
    let full = (x: number) => (x <= 2 ? semi(x) : semi(-x + 4));

    return full(x0 % 4.0);
}

export function broad_sine2(x: number): number {
    let s = sin((x - 1) * PI * 0.5);
    return 1 + sqrt(abs(s)) * sign(s);
}

export function gaussian2(x: number, c: number): number {
    return Math.pow(2, (x * x) / (-2 * c * c));
}

export function mix(a: number, b: number, t: number): number {
    return (1 - t) * a + t * b;
}

export function smin(a: number, b: number, k: number): number {
    let h = min(1, max(0, 0.5 + 0.5 * (a - b) / k));
    return mix(a, b, h) - k * h * (1.0 - h);
}
