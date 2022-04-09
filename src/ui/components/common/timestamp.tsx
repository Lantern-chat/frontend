import type { JSX } from "solid-js";
import type dayjs from "lib/time";

import { createCalendar, createTimestamp } from "ui/hooks/createTimestamp";
import { UIText } from "ui/components/common/ui-text";

export interface ITimestampProps {
    time: NonNullable<dayjs.ConfigType>,
    format?: string,
}

export type ICalendarProps = Omit<ITimestampProps, 'format'>;

export function UITimestamp(props: ITimestampProps): JSX.Element {
    let ts = createTimestamp(() => props.time, () => props.format);
    return <UIText text={ts()} />;
}

export function UICalendar(props: ICalendarProps): JSX.Element {
    let ts = createCalendar(() => props.time);
    return <UIText text={ts()} />;
}