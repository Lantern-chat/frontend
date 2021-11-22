import classNames from "classnames";
import React, { useCallback, useReducer, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { UserPreferenceFlags } from "state/models";
import { selectPrefsFlag } from "state/selectors/prefs";

import { FullscreenModal } from "ui/components/modal";

import { Hotkey, useClickEater, useMainHotkey } from "ui/hooks/useMainClick";

enum ImgActType {
    Load,
    SetPan,
    Pan,
}

interface ImageLoadAction {
    t: ImgActType.Load,
    width: number,
    height: number,
}

interface ImageSetPanAction {
    t: ImgActType.SetPan,
    panning: boolean,
}

interface ImagePanAction {
    t: ImgActType.Pan,
    dx: number,
    dy: number,
}

type ImageAction = ImageLoadAction | ImageSetPanAction | ImagePanAction;

interface ImageState {
    width: number,
    height: number,
    x: number,
    y: number,
    z: number,
    is_panning: boolean,
    is_zooming: boolean,
}

const DEFAULT_STATE: ImageState = { width: 0, height: 0, x: 0, y: 0, z: 0, is_panning: false, is_zooming: false };

function image_reducer(state: ImageState, action: ImageAction): ImageState {
    switch(action.t) {
        case ImgActType.Load: {
            return { ...state, width: action.width, height: action.height };
        }
        case ImgActType.SetPan: {
            return { ...state, is_panning: action.panning };
        }
    }

    return state;
}

export interface IImageZoomProps {
    src: string,
    title: string,
    onClose(): void;
}

import "./image_zoom.scss";
export const ImageZoom = React.memo(({ src, title, onClose }: IImageZoomProps) => {
    let reduce_motion = useSelector(selectPrefsFlag(UserPreferenceFlags.ReduceAnimations));

    let img = useRef<HTMLImageElement>(null),
        eat = useClickEater(),
        wx = window.innerWidth, wy = window.innerHeight,
        [closing, setClosing] = useState(false),
        [state, dispatch] = useReducer(image_reducer, DEFAULT_STATE);

    let on_load = useCallback(() => {
        let i = img.current;
        if(i) {
            dispatch({ t: ImgActType.Load, width: i.naturalWidth, height: i.naturalHeight });
        }
    }, [img.current]);

    let do_close = useCallback(() => {
        if(reduce_motion) return onClose();

        setClosing(true);
        setTimeout(() => onClose(), 150);
    }, [onClose, reduce_motion]);

    useMainHotkey(Hotkey.Escape, () => do_close(), [do_close]);

    let on_mousedown = useCallback(() => {
        //dispatch()
    }, []);

    let on_click_image = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    let on_click_background = (e: React.MouseEvent) => {
        e.stopPropagation();
        do_close();
    };

    return (
        <FullscreenModal>
            <div className={classNames("ln-image-zoom", { closing })} onClick={on_click_background} onContextMenu={eat}>
                <img src={src} ref={img} onLoad={on_load} onClick={on_click_image} style={{
                    transform: `tranlate2D(${state.x}px, ${state.y}px) scale(${state.z})`
                }} />
            </div>
        </FullscreenModal>
    );
});