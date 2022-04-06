import { createMemo } from "solid-js";
import { UIText } from "ui/components/common/ui-text";
import { useI18nContext } from "ui/i18n/i18n-solid";

export interface IBotLabelProps {
    v?: boolean,
}

import "./bot_label.scss";
export function BotLabel(props: IBotLabelProps) {
    let { LL } = useI18nContext();

    let bot = createMemo(() => LL().main.BOT({ verified: !!props.v }));

    return (
        <span className="bot-label" title={bot()}>
            <UIText text={bot()} />
        </span>
    );
}