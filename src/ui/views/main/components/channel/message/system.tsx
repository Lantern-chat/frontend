import { MessageKind } from "state/models";
import { VectorIcon } from "ui/components/common/icon";
import { IMessageProps } from "./common";

import { createCalendar } from "ui/hooks/createTimestamp";

import { Icons } from "lantern-icons";
import { useI18nContext } from "ui/i18n/i18n-solid";
import { Markdown } from "ui/components/common/markdown";
import { fnv1a } from "lib/fnv";
import { loadedLocales } from "ui/i18n/i18n-util";
import { formatters } from "ui/i18n";

export function SystemMessage(props: IMessageProps) {
    let { locale } = useI18nContext(), f = () => formatters[locale()];

    let calendar = createCalendar(() => props.msg.ts);

    return (
        <>
            <div class="ln-msg__side ln-system-message">
                <VectorIcon id={Icons.ArrowThinRight} />
            </div>

            <div class="ln-msg__message ln-system-message">
                <Markdown source={system_body(props)} class="ln-msg"
                    extra={<span class="ui-text ln-system-sub" title={f().timestamp(props.msg.ts) as string} textContent={calendar()} />}
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
                idx = fnv1a(user) % (loadedLocales[locale()].main.system.welcome as any).length;

            return LL().main.system.welcome[idx]({ user });
        }
        case MessageKind.Unavailable: {
            return LL().main.system.unavailable();
        }
    }

    return "";
}