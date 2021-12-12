import React, { useRef, useLayoutEffect } from "react";

export const SnowCanvas = React.memo(() => {
    let canvas_ref = useRef(null);

    return (<canvas id="seasonal-winter" ref={canvas_ref} />);
});

if(__DEV__) {
    SnowCanvas.displayName = "SnowCanvas";
}