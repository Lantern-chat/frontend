import { createEffect, onMount, children, onCleanup } from "solid-js";
import { ErrorBoundary, Show } from "solid-js/web";
import { useStructuredSelector } from "solid-mutant";

import { useI18nContext } from "ui/i18n/i18n-solid";

import { RootState, useRootSelector } from "state/root";
import { activeRoom } from "state/selectors/active";
import { Snowflake } from "state/models";

import { RoomHeader } from "./header";
import { MessageFeed } from "./feed";
import { MessageBox } from "./input/box";
import { DisplayError } from "ui/components/common/error";
import { MemberList } from "../party/member_list";

function clearInner(node: Node | null) {
    while(node?.hasChildNodes()) {
        clear(node.firstChild);
    }
}

function clear(node: Node | null) {
    while(node?.hasChildNodes()) {
        clear(node.firstChild);
    }
    node?.parentNode?.removeChild(node);
}

import "./room.scss";
export function Room() {
    let state = useStructuredSelector({
        use_mobile_view: (state: RootState) => state.window.use_mobile_view,
        show_user_list: (state: RootState) => state.window.show_user_list,
    });

    let wrapper: HTMLDivElement | undefined, feed = <Feed /> as HTMLElement;

    // Instead of recreating the feed on mobile/desktop change,
    // just move the node around and adjust the wrapper style.
    createEffect(() => {
        let w = wrapper!;
        w.style["display"] = state.use_mobile_view ?
            // append to ln-room
            (w.parentNode!.appendChild(feed), "none") :
            // insert before sentinel span
            (w.insertBefore(feed, w.firstChild), "");
    });

    //onCleanup(() => (clearInner(feed), feed.remove()));

    // TODO: Revisit this to avoid the sentinel span?
    return (
        <div class="ln-room">
            <ErrorBoundary fallback={err => <DisplayError error={err} />}>
                <RoomHeader />

                <div ref={wrapper} class="ln-room__wrapper" >
                    {/* Desktop Feed goes here */}

                    <span style={{ display: "none" }} /> {/* Sentinel span to avoid clashing with member list */}

                    <Show when={!state.use_mobile_view && state.show_user_list}>
                        <div class="ln-room__members">
                            <MemberList />
                        </div>
                    </Show>
                </div>

                {/* Mobile Feed goes here */}
            </ErrorBoundary>
        </div >
    );
}

function Feed() {
    let active_room = useRootSelector(activeRoom);

    return (
        <div class="ln-room__feed">
            <div class="ln-room__banners">
                {__DEV__ && <DevBanner />}
            </div>

            <Show when={active_room()} fallback={
                <div class="ln-center-standalone">Loading...</div>
            }>
                <MessageFeed />
            </Show>

            <MessageBox />
        </div>
    )
}

function DevBanner() {
    let { LL } = useI18nContext();
    return (
        <div class="ln-banner error ui-text" textContent={LL().DEV_BANNER()} />
    );
}