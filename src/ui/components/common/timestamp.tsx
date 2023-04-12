import type { DateParams } from "lib/time";
import type { JSX } from "solid-js";

import { createCalendar } from "ui/hooks/createTimestamp";

export interface ITimestampProps {
    time: NonNullable<DateParams>,
    format?: string,
}

export type ICalendarProps = Omit<ITimestampProps, "format">;

export function UICalendar(props: ICalendarProps): JSX.Element {
    let ts = createCalendar(() => props.time);
    return <span class="ui-text" textContent={ts()} />;
}