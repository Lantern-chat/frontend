import { createMemo } from "solid-js";
import dayjs from "dayjs";
import { MessageKind } from "state/models";
import { VectorIcon } from "ui/components/common/icon";
import { IMessageProps } from "./common";

import { createCalendar, createTimestamp } from "ui/hooks/createTimestamp";

import { Icons } from "lantern-icons";
import { useI18nContext } from "ui/i18n/i18n-solid";
import { Markdown } from "ui/components/common/markdown";
import { fnv1a } from "lib/fnv";
import { loadedLocales } from "ui/i18n/i18n-util";

export function SystemMessage(props: IMessageProps) {
    let ts = createMemo(() => props.msg.ts),
        title = createTimestamp(ts),
        calendar = createCalendar(ts);

    return (
        <>
            <div class="ln-msg__side ln-system-message">
                <VectorIcon id={Icons.ArrowThinRight} />
            </div>

            <div class="ln-msg__message ln-system-message">
                <Markdown source={system_body(props)} class="ln-msg"
                    extra={<span class="ui-text ln-system-sub" title={title()} textContent={calendar()} />}
                />
            </div>
        </>
    );
}

function system_body(props: IMessageProps): string {
    let { LL, locale } = useI18nContext();

    switch(props.msg.msg.kind) {
        case MessageKind.Welcome: {
            let user = props.msg.msg.author.id,
                length = (loadedLocales[locale()].main.system.welcome as any).length;

            return LL().main.system.welcome[fnv1a(user) % length]({ user });
        }
    }

    return "";
}