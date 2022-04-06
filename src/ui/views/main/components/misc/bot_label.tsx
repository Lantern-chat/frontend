import { UIText } from "ui/components/common/ui-text";
import { useI18nContext } from "ui/i18n/i18n-solid";

import "./bot_label.scss";
export function BotLabel() {
    let { LL } = useI18nContext();

    return (
        <span className="bot-label" title="Bot">
            <UIText text={LL().main.BOT()} />
        </span>
    );
}