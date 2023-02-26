
import { createSignal, Match, Show, Switch, untrack } from "solid-js";
import { Dynamic } from "solid-js/web";

import { usePrefs } from "state/contexts/prefs";
import { user_is_system } from "state/models";
import { IMessageState } from "state/mutators/chat";
import { PositionedModal } from "ui/components/modal/positioned";
import { createSimplePositionedContextMenu } from "ui/hooks/useMain";
import { useLocale } from "ui/i18n";
import { MsgContextMenu } from "../../menus/msg_context";


import { CompactMessage } from "../message/compact";
import { CozyMessage } from "../message/cozy";
import { SystemMessage } from "../message/system";
import { ActionWidget } from "./actions";

function DateChange(props: { ts: Date }) {
    let { f } = useLocale();

    return (
        <div class="ln-date-change">
            <span class="ui-text">{f().date(props.ts)}</span>
        </div>
    );
}

export function Message(props: { msg: IMessageState }) {
    let prefs = usePrefs();

    let [warn, setWarn] = createSignal(false),
        [pos, main_click_props] = createSimplePositionedContextMenu({
            onMainClick: () => setWarn(false),
        });

    // these properties don't change
    let System: undefined | typeof SystemMessage;
    if(!!props.msg.msg.kind || user_is_system(props.msg.msg.author)) {
        System = SystemMessage;
    }

    return (
        <>
            {/*Must use For-friendly constructs here*/}
            <Switch>
                <Match when={prefs.ShowDateChange() && props.msg.sd}>
                    <DateChange ts={props.msg.ts} />
                </Match>
                <Match when={prefs.GroupLines() && props.msg.sg}>
                    <hr />
                </Match>
            </Switch>

            <li
                id={props.msg.msg.id}
                data-author={props.msg.msg.author.id}
                class="ln-msg__outer"
                classList={{
                    "highlighted": !!pos(),
                    "warning": !!pos() && warn(),
                    "sg": props.msg.sg,
                }}
                {...main_click_props}
            >
                <div class="ln-msg__wrapper" role="article">
                    <Dynamic component={System || (prefs.CompactView() ? CompactMessage : CozyMessage)} {...props} />

                    <Show keyed when={pos()}>
                        {pos => (
                            <PositionedModal rect={pos}>
                                <MsgContextMenu msg={props.msg} pos={pos} onConfirmChange={(pending: boolean) => setWarn(pending)} />
                            </PositionedModal>
                        )}
                    </Show>

                    <ActionWidget msg={props.msg.msg} />
                </div>
            </li>
        </>
    );
}


