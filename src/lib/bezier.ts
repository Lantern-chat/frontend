const EPSILON = 1e-2; // Precision

// https://github.com/thednp/CubicBezier
export class CubicBezier {
    cx: number;
    bx: number;
    ax: number;
    cy: number;
    by: number;
    ay: number;

    constructor(p1x: number, p1y: number, p2x: number, p2y: number) {
        this.cx = 3.0 * p1x;
        this.bx = 3.0 * (p2x - p1x) - this.cx;
        this.ax = 1.0 - this.cx - this.bx;
        this.cy = 3.0 * p1y;
        this.by = 3.0 * (p2y - p1y) - this.cy;
        this.ay = 1.0 - this.cy - this.by;
    }

    /// Return the X value at T
    tx(t: number): number {
        return ((this.ax * t + this.bx) * t + this.cx) * t;
    }

    /// Return the Y value at T
    ty(t: number): number {
        return ((this.ay * t + this.by) * t + this.cy) * t;
    }

    /// Return the derivative with respect to X at T
    tdx(t: number): number {
        return (3.0 * this.ax * t + 2.0 * this.bx) * t + this.cx;
    }

    /// Compute the Y value at X
    y(x: number): number {
        if(x <= 0) return 0;
        if(x >= 1) return 1;

        return this.ty(this.solve_x(x));
    }

    /// Solve for T at X
    solve_x(x: number): number {
        let t0, t1, t2, x2, d2, i;

        // First try a few iterations of Newton's method -- normally very fast.
        for(t2 = x, i = 0; i < 32; i += 1) {
            x2 = this.tx(t2) - x;
            if(Math.abs(x2) < EPSILON) return t2;
            d2 = this.tdx(t2);
            if(Math.abs(d2) < EPSILON) break;
            t2 -= x2 / d2;
        }

        // No solution found - use bi-section
        t0 = 0.0;
        t1 = 1.0;
        t2 = x;

        if(t2 < t0) return t0;
        if(t2 > t1) return t1;

        while(t0 < t1) {
            x2 = this.tx(t2);
            if(Math.abs(x2 - x) < EPSILON) return t2;
            if(x > x2) t0 = t2;
            else t1 = t2;

            t2 = (t1 - t0) * 0.5 + t0;
        }

        // Give up
        return t2;
    }
}