import type { JSX } from "solid-js";
import type dayjs from "lib/time";

import { createCalendar, createTimestamp, DEFAULT_FORMAT } from "ui/hooks/createTimestamp";

export interface ITimestampProps {
    time: NonNullable<dayjs.ConfigType>,
    format?: string,
}

export type ICalendarProps = Omit<ITimestampProps, 'format'>;

export function UITimestamp(props: ITimestampProps & { span?: JSX.HTMLAttributes<HTMLSpanElement> }): JSX.Element {
    let ts = createTimestamp(() => props.time, () => props.format || DEFAULT_FORMAT);
    return <span className="ui-text" textContent={ts()} {...props.span || {}} />;
}

export function UICalendar(props: ICalendarProps & { span?: JSX.HTMLAttributes<HTMLSpanElement> }): JSX.Element {
    let ts = createCalendar(() => props.time);
    return <span className="ui-text" textContent={ts()} {...props.span || {}} />;
}