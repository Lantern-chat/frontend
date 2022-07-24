import { ErrorBoundary, Show } from "solid-js/web";
import { useStructuredSelector } from "solid-mutant";

import { useI18nContext } from "ui/i18n/i18n-solid";

import { ReadRootState, useRootSelector } from "state/root";
import { activeRoom } from "state/selectors/active";
import { Snowflake } from "state/models";

import { ChannelHeader } from "./header";
import { MessageFeed } from "./feed";
import { MessageBox } from "./input/box";
import { DisplayError } from "ui/components/common/error";
import { MemberList } from "../party/member_list";


import "./channel.scss";
import ChatCompletetions from "../../modals/chat_completions/chat_completions";
import { createSignal } from "solid-js";
export function Channel() {
    let state = useStructuredSelector({
        use_mobile_view: (state: ReadRootState) => state.window.use_mobile_view,
        show_user_list: (state: ReadRootState) => state.window.show_user_list,
    });

    return (
        <div class="ln-channel">
            <ErrorBoundary fallback={err => <DisplayError error={err} />}>
                <ChannelHeader />

                {/*mobile doesn't need to wrap anything or show the user-list*/}
                <Show when={!state.use_mobile_view} fallback={<Feed />}>
                    <div class="ln-channel__wrapper">
                        <Feed />

                        <Show when={state.show_user_list}>
                            <div class="ln-channel__members">
                                <MemberList />
                            </div>
                        </Show>
                    </div>
                </Show>
            </ErrorBoundary>
        </div>
    );
}

function Feed() {
    let active_room = useRootSelector(activeRoom);
    let [typingMessage, setTypingMessage] = createSignal("");
    let [cursorPosition, setCursorPosition] = createSignal(0);
    let [showingSuggestions, setShowingSuggestions] = createSignal(false);

    const typeMessage = (new_message: string) => setTypingMessage(new_message);
    const changeCursorPosition = (new_position: number) => setCursorPosition(new_position);
    const showSuggestions = (show: boolean) => setShowingSuggestions(show);

    return (
        <div class="ln-channel__feed">
            <div class="ln-channel__banners">
                {__DEV__ && <DevBanner />}
            </div>

            <Show when={active_room()} fallback={<div class="ln-center-standalone">Loading...</div>}>
                <MessageFeed />
            </Show>
            <ChatCompletetions typingMessageValue={typingMessage} cursorPosition={cursorPosition} typeMessage={typeMessage} showSuggestions={showSuggestions} />
            <MessageBox typingMessageValue={typingMessage} typeMessage={typeMessage} changeCursorPosition={changeCursorPosition} showingSuggestions={showingSuggestions} />
        </div>
    )
}

function DevBanner() {
    let { LL } = useI18nContext();
    return (
        <div class="ln-banner error ui-text" textContent={LL().DEV_BANNER()} />
    );
}