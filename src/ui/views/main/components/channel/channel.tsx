import { ErrorBoundary, Show } from "solid-js/web";
import { useStructuredSelector } from "solid-mutant";

import { RootState, useRootSelector } from "state/root";
import { activeRoom } from "state/selectors/active";
import { Snowflake } from "state/models";

import { ChannelHeader } from "./header";
import { MessageFeed } from "./feed";
import { MessageBox } from "./input/box";
import { DisplayError } from "ui/components/common/error";
import { MemberList } from "../party/member_list";


import "./channel.scss";
export function Channel() {
    let state = useStructuredSelector({
        use_mobile_view: (state: RootState) => state.window.use_mobile_view,
        show_user_list: (state: RootState) => state.window.show_user_list,
    });

    return (
        <div className="ln-channel">
            <ErrorBoundary fallback={err => <DisplayError error={err} />}>
                <ChannelHeader />

                {/*mobile doesn't need to wrap anything or show the user-list*/}
                <Show when={!state.use_mobile_view} fallback={<Feed />}>
                    <div className="ln-channel__wrapper">
                        <Feed />

                        <Show when={state.show_user_list}>
                            <div className="ln-channel__members">
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

    return (
        <div className="ln-channel__feed">
            <div className="ln-channel__banners">
                {__DEV__ && <DevBanner />}
            </div>

            <Show when={active_room()} fallback={<div className="ln-center-standalone">Loading...</div>}>
                <MessageFeed />
            </Show>

            <MessageBox />
        </div>
    )
}

function DevBanner() {
    return (
        <div className="ln-banner error ui-text">
            This is a development build.
        </div>
    );
}