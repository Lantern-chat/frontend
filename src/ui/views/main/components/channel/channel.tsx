import { ErrorBoundary, Show } from "solid-js/web";
import { useStructuredSelector } from "solid-mutant";

import { useI18nContext } from "ui/i18n/i18n-solid";

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
        <div class="ln-channel">
            <ErrorBoundary fallback={err => <DisplayError error={err} />}>
                <ChannelHeader />

                {/*mobile doesn't need to wrap anything or show the user-list*/}
                {() => state.use_mobile_view ? (<Feed />) : (
                    <div class="ln-channel__wrapper">
                        <Feed />

                        {() => state.show_user_list && (
                            <div class="ln-channel__members">
                                <MemberList />
                            </div>
                        )}
                    </div>
                )}
            </ErrorBoundary>
        </div >
    );
}

function Feed() {
    let active_room = useRootSelector(activeRoom);

    return (
        <div class="ln-channel__feed">
            <div class="ln-channel__banners">
                {__DEV__ && <DevBanner />}
            </div>

            {() => !!active_room() ? <MessageFeed /> : <div class="ln-center-standalone">Loading...</div>}

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