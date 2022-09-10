import type { JSX } from "solid-js";
import type dayjs from "lib/time";

import { createCalendar } from "ui/hooks/createTimestamp";

export interface ITimestampProps {
    time: NonNullable<dayjs.ConfigType>,
    format?: string,
}

export type ICalendarProps = Omit<ITimestampProps, 'format'>;

export function UICalendar(props: ICalendarProps): JSX.Element {
    let ts = createCalendar(() => props.time);
    return <span class="ui-text" textContent={ts()} />;
}