import React, { useRef, useMemo, useState, useEffect, useLayoutEffect } from "react";

export interface ITooltipProps {
    children: React.ReactNode;
    x?: -1 | 0 | 1;
    y?: -1 | 0 | 1;
}

import "./tooltip.scss";
export const Tooltip = React.memo((props: ITooltipProps) => {
    let body = useRef<HTMLDivElement>(null);
    let [, forceRender] = useState(false);

    useLayoutEffect(() => forceRender(true), []);

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

    return (
        <div className="ln-tooltip-anchor">
            <div ref={body} className="ln-tooltip-body" style={style}>
                {props.children}
            </div>
        </div>
    );
});

if(__DEV__) {
    Tooltip.displayName = "Tooltip";
}