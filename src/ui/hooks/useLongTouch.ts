import React, { useCallback, useEffect, useRef, useState } from "react";

type LongTouchEvent<T> = (ev: React.TouchEvent<T>) => void;

export interface ILongTouchProps<T> {
    onTouchStart: (ev: React.TouchEvent<T>) => void,
    onTouchEnd: (ev: React.TouchEvent<T>) => void,
}

//export function useLongTouch<T extends HTMLElement>(cb: LongTouchEvent<T>): ILongTouchProps<T> {
//
//}