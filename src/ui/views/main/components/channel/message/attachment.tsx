import React, { useState } from "react";
import { IS_MOBILE } from "lib/user_agent";

function eat(e: React.SyntheticEvent) {
    e.stopPropagation();
}

import { Message, Attachment } from "state/models";
import { message_attachment_url } from "config/urls";

import { reactElement } from "ui/components/common/markdown/markdown";

import "./attachment.scss";
export const MsgAttachment = React.memo(({ msg, attachment }: { msg: Message, attachment: Attachment }) => {
    let [error, setError] = useState(false);

    let embed, mime = attachment.mime,
        id = attachment.id,
        url = message_attachment_url(msg.room_id, id, attachment.filename),
        title = attachment.filename;

    if(mime && !error) {
        let common = {
            title,
            onContextMenu: eat,
            src: url,
            onError: () => setError(true)
        };

        if(mime.startsWith('video')) {
            if(IS_MOBILE) {
                // the #t=0.0001 forces iOS Safari to preload the first frame and display that as a preview
                common.src += '#t=0.0001';
            }

            // TODO: Record playback position for moving into a modal and continuing playback?
            embed = reactElement('video', id, {
                ...common,
                preload: "metadata",
                controls: true,
            });

            //embed = <video title={title} onContextMenu={eat} preload="metadata" src={url} controls onError={() => setError(true)} />;
        } else if(mime.startsWith('audio')) {
            //embed = <audio title={title} onContextMenu={eat} src={url} controls onError={() => setError(true)} />

            embed = reactElement('audio', id, {
                ...common,
                controls: true,
            });

            embed = (
                <div className="ln-audio">
                    {embed}
                </div>
            )

        } else if(mime.startsWith('image')) {
            //embed = <img title={title} onContextMenu={eat} src={url} onError={() => setError(true)} />;

            embed = reactElement('img', id, common);
        }
    }

    if(!embed) {
        embed = <a target="__blank" title={title} href={url}>{attachment.filename}</a>;
    }

    return (
        <div className="ln-msg-attachment">
            {embed}
        </div>
    )
});