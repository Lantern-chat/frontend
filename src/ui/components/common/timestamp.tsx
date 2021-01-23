import dayjs from "client/time";
import Preact, { useContext } from "preact/compat";
import { LocaleContext } from "ui/i18n";

export interface TimestampProps {
    time: dayjs.ConfigType,
    format?: string,
}

export const DEFAULT_FORMAT = "dddd, MMM Do YYYY, h:mm A";

export const Timestamp: Preact.FunctionComponent<TimestampProps> = Preact.memo((props: TimestampProps) => (
    <>{dayjs(props.time).locale(useContext(LocaleContext))
        .format(props.format || DEFAULT_FORMAT)}</>
));

if(process.env.NODE_ENV !== 'production') {
    Timestamp.displayName = "Timestamp";
}