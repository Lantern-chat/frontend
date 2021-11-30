import type React from "react";
import type { Attachment } from "state/models";

export interface ILightBoxRendererProps {
    attachment: Attachment,
    reduce_motion: boolean,

    onImgClick(e: React.MouseEvent): void;
    onBackClick(e: React.MouseEvent): void;

    onImgContextMenu(e: React.MouseEvent): void;
    onBackContextMenu(e: React.MouseEvent): void;

    onImgMouseDown(e: React.MouseEvent): void;
    onBackMouseDown(e: React.MouseEvent): void;

    onMouseMove(e: React.MouseEvent): void;
    onMouseUp(e: React.MouseEvent): void;

    onWheel(e: React.WheelEvent): void;

    onImgTouchDown(e: React.TouchEvent): void;
    onTouchUp(e: React.TouchEvent): void;
    onTouchMove(e: React.TouchEvent): void;
    onTouchCancel(e: React.TouchEvent): void;
}

export interface LightBoxRenderer extends React.Component<ILightBoxRendererProps> {
    trans(dx: number, dy: number): void;
    scale(dz: number): void;

    /// Refresh the render, such as when the window resizes
    refresh(): void;

    close(): void;

    setImgCursor(value: string): void;
    setBackCursor(value: string): void;
}