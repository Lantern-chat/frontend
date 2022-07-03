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

export interface IChannelProps{
    attaching_files: File[];
    remove_attaching_file(file: File): void;
    input_attachment_element: HTMLElement|undefined;
}

import "./channel.scss";
import Attachment from "./attachment";
export function Channel(props: IChannelProps) {
    let state = useStructuredSelector({
        use_mobile_view: (state: ReadRootState) => state.window.use_mobile_view,
        show_user_list: (state: ReadRootState) => state.window.show_user_list,
    });

    return (
        <div class="ln-channel">
            <ErrorBoundary fallback={err => <DisplayError error={err} />}>
                <ChannelHeader />

                {/*mobile doesn't need to wrap anything or show the user-list*/}
                <Show when={!state.use_mobile_view} fallback={<Feed {...props} />}>
                    <div class="ln-channel__wrapper">
                        <Feed {...props} />

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

function Feed(props: IChannelProps) {
    let active_room = useRootSelector(activeRoom);

    return (
        <div class="ln-channel__feed">
            <div class="ln-channel__banners">
                {__DEV__ && <DevBanner />}
            </div>

            <Show when={active_room()} fallback={<div class="ln-center-standalone">Loading...</div>}>
                <MessageFeed />
            </Show>
            <Show when={props.attaching_files.length > 0}>
                <Attachment {...props} />
            </Show>

            <MessageBox {...props} />
        </div>
    )
}

function DevBanner() {
    let { LL } = useI18nContext();
    return (
        <div class="ln-banner error ui-text" textContent={LL().DEV_BANNER()} />
    );
}