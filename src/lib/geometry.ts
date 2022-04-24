export function rect_overlaps(a: DOMRectReadOnly, b: DOMRectReadOnly): boolean {
    return a.left < b.right && a.right > b.left && a.top > b.bottom && a.bottom < b.top;
}

export function heighten(rect: DOMRectReadOnly, h: number): DOMRectReadOnly {
    let h2 = rect.height * h, dh2 = (rect.height - h2) / 2;
    return { ...rect, height: h2, top: rect.top - dh2, bottom: rect.bottom + dh2 };
}

export function heightened_rect_overlaps(a: DOMRectReadOnly, b: DOMRectReadOnly, h: number): boolean {
    let h2 = b.height * h, dh2 = (b.height - h2) / 2;
    return a.left < b.right && a.right > b.left && a.top > (b.bottom + dh2) && a.bottom < (b.top - dh2);
}