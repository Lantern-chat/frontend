import React, { useRef, useMemo, useState, useEffect } from "react";

export interface ITooltipProps {
    children: React.ReactNode;
    x?: -1 | 0 | 1;
    y?: -1 | 0 | 1;
}

import "./tooltip.scss";
export const Tooltip = (props: ITooltipProps) => {
    let body = useRef<HTMLDivElement | null>(null);

    let { children, x = 0, y = 0 } = props;

    let rect = body.current?.getBoundingClientRect();

    let style: React.CSSProperties = useMemo(() => {
        if(rect != null) {
            let { width, height } = rect;

            let right, left, top, bottom;
            if(x == 0) {
                right = -width / 2;
            } else if(x < 0) {
                right = '100%';
            } else {
                left = '100%';
            }

            if(y == 0) {
                top = -height / 2 + 10;
            } else if(y > 0) {
                bottom = '100%';
            } else {
                top = '100%';
            }

            return { top, right, left, bottom }
        }
        return {};
    }, [rect, props.x, props.y]);



    /*
    let [render, forceRender] = useState(0);

    useEffect(() => {
        let listener = () => forceRender(render + 1);
        window.addEventListener('resize', listener);
        return () => window.removeEventListener('resize', listener);
    }, []);

    let h = window.innerWidth;
    let w = window.innerHeight;

    let style = useMemo(() => {
        if(rect != null) {
            let { x, y, width, height } = rect;

            console.log(rect, h, w);

            let top_margin = h / 3;
            let bottom_margin = h - top_margin;

            let left_margin = w / 3;
            let right_margin = w - left_margin;

            let on_top = y < top_margin;
            let on_bottom = y > bottom_margin;

            let on_left = x < left_margin;
            let on_right = x > right_margin;

            let top = undefined;
            if(on_top) {
                top = 0;
            } else if(on_bottom) {
                top = 1;
            } else {
                top = '-50%';
            }

            return {
                top,
                left: '50%',
            };
        }

        return {};
    }, [rect, h, w]);
    */

    return (
        <div className="ln-tooltip-anchor">
            <div ref={body} className="ln-tooltip-body" style={style}>
                {props.children}
            </div>
        </div>
    )
};