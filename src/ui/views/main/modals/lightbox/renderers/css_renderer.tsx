import { shallowEqualObjects } from "lib/compare";
import React from "react";
import type { LightBoxRenderer, ILightBoxRendererProps } from "./";

export class LightBoxCssRenderer extends React.Component<ILightBoxRendererProps> implements LightBoxRenderer {
    shouldComponentUpdate(next: ILightBoxRendererProps) {
        return !shallowEqualObjects(this.props.attachment, next.attachment);
    }

    trans(dx: number, dy: number) {

    }

    scale(dz: number) {

    }

    /// Refresh the render, such as when the window resizes
    refresh() {

    }

    close() {

    }

    setImgCursor(value: string) {

    }
    setBackCursor(value: string) {

    }

    render() {
        return null
    }
}