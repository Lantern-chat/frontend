import React, { useState } from "react";
import { IS_MOBILE } from "lib/user_agent";
import { format_bytes } from "lib/formatting";

function eat(e: React.SyntheticEvent) {
    e.stopPropagation();
}

import { Message, Attachment } from "state/models";
import { message_attachment_url } from "config/urls";

import { reactElement } from "ui/components/common/markdown/markdown";

import { Glyphicon } from "ui/components/common/glyphicon";
import { MimeIcon } from "ui/components/mime_icon";

import SaveIcon from "icons/glyphicons-pro/glyphicons-basic-2-4/svg/individual-svg/glyphicons-basic-199-save.svg";

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

        } else if(mime.startsWith('image') && attachment.size < (1024 * 1024 * 30)) {
            //embed = <img title={title} onContextMenu={eat} src={url} onError={() => setError(true)} />;

            embed = reactElement('img', id, common);
        }
    }

    if(!embed) {
        let size = format_bytes(attachment.size);
        title = title + ' (' + size + ')';

        embed = (
            <div className="ln-msg-attachment__generic">
                <div>
                    <MimeIcon name={attachment.filename} hint={mime} />
                </div>
                <div className="ln-attachment-link ui-text">
                    <a target="__blank" title={title} href={url}>{attachment.filename}</a>
                    <span className="ln-attachment-size">{size}</span>
                </div>
                <a target="__blank" title={title} href={url + '?download'}>
                    <Glyphicon src={SaveIcon} />
                </a>
            </div>
        );
    }

    return (
        <div className="ln-msg-attachment">
            {embed}
        </div>
    )
});
