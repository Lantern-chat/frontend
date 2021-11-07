import React from "react";
import { useSelector } from "react-redux";
import { createStructuredSelector } from "reselect";

import { RootState } from "state/root";

import { ChannelHeader } from "./header";
import { MessageFeed } from "./feed";
import { MessageBox } from "./message/box";
import { Snowflake } from "state/models";
import { ErrorBoundary } from "ui/components/error";
import { MemberList } from "../party/member_list";

export interface IChannelProps {
    channel?: Snowflake,
    //party: Snowflake,
}

let channel_selector = createStructuredSelector({
    use_mobile_view: (state: RootState) => state.window.use_mobile_view,
    show_user_list: (state: RootState) => state.window.show_user_list,
});

import "./channel.scss";
export const Channel = React.memo((props: IChannelProps) => {
    let { use_mobile_view, show_user_list } = useSelector(channel_selector);

    let feed, feed_box, member_list, inner;
    if(props.channel) {
        feed_box = <MessageFeed channel={props.channel} />;
    } else {
        // TODO: Replace with fake CSS channel?
        feed_box = <div className="ln-center-standalone">Loading...</div>;
    }

    feed = (
        <div className="ln-channel__feed">
            <div className="ln-channel__banners">
                {__DEV__ && <DevBanner />}
            </div>
            {feed_box}
            <MessageBox channel={props.channel} />
        </div>
    );

    if(use_mobile_view) {
        // mobile doesn't need to wrap anything or show the user-list
        inner = feed;
    } else {
        if(show_user_list) {
            member_list = (
                <div className="ln-channel__members">
                    <MemberList />
                </div>
            );
        }

        inner = (
            <div className="ln-channel__wrapper">
                {feed}
                {member_list}
            </div>
        );
    }

    return (
        <div className="ln-channel">
            <ErrorBoundary>
                <ChannelHeader />
                {inner}
            </ErrorBoundary>
        </div>
    );
});

const DevBanner = React.memo(() => {
    return (
        <div className="ln-banner error ui-text">
            This is a development build.
        </div>
    )
})