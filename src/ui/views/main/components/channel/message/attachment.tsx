import React, { useCallback, useContext, useState } from "react";
import { IS_MOBILE } from "lib/user_agent";
import { format_bytes } from "lib/formatting";

import { Message, Attachment } from "state/models";
import { message_attachment_url } from "config/urls";

import { MainContext, useClickEater, useMainClick, useSimpleToggleOnClick } from "ui/hooks/useMainClick";

import { reactElement } from "ui/components/common/markdown/markdown";

import { LightBox } from "ui/views/main/modals/image_zoom";
import { AnimatedGif } from "ui/components/common/gif";
import { Glyphicon } from "ui/components/common/glyphicon";
import { MimeIcon } from "ui/components/mime_icon";

import SaveIcon from "icons/glyphicons-pro/glyphicons-basic-2-4/svg/individual-svg/glyphicons-basic-199-save.svg";

import { AnchoredModal } from "ui/components/modal/anchored_modal";

import "./attachment.scss";
export const MsgAttachment = React.memo(({ msg, attachment }: { msg: Message, attachment: Attachment }) => {
    let [error, setError] = useState(false),
        eat = useClickEater();

    let embed,
        mime = attachment.mime,
        id = attachment.id,
        url = message_attachment_url(msg.room_id, id, attachment.filename),
        title = attachment.filename;


    //let [showTitle, setShowTitle] = useState(false);

    if(mime && !error) {
        let common = {
            id,
            onContextMenu: eat,
            src: url,
            onError: () => setError(true),
            //onMouseEnter: () => setShowTitle(true),
            //onMouseLeave: () => setShowTitle(false),
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
            embed = <ImageAttachment img={common} attachment={attachment} />;
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
                    <a target="__blank" title={title} href={url} onContextMenu={eat}>{attachment.filename}</a>
                    <span className="ln-attachment-size">{size}</span>
                </div>
                <a target="__blank" title={title} href={url + '?download'}>
                    <Glyphicon src={SaveIcon} />
                </a>
            </div>
        );
    }
    //else {
    //    embed = (
    //        <>
    //            <AnchoredModal show={showTitle}>
    //                {title}
    //            </AnchoredModal>
    //            {embed}
    //        </>
    //    )
    //}

    return (
        <div className="ln-msg-attachment">
            {embed}
        </div>
    )
});

interface IImageAttachmentProps {
    img: React.ImgHTMLAttributes<HTMLImageElement>,
    attachment: Attachment
}

const ImageAttachment = React.memo((props: IImageAttachmentProps) => {
    //embed = <img title={title} onContextMenu={eat} src={url} onError={() => setError(true)} />;


    let main = useContext(MainContext),
        [show, setShow] = useState(false);

    let onClick = useCallback((e: React.MouseEvent) => {
        main.clickAll(e);
        setShow(true);
    }, [main]);

    let img_props: React.ImgHTMLAttributes<HTMLImageElement> = { ...props.img, loading: 'lazy', onClick };

    let embed, m: RegExpMatchArray | null;
    if(m = props.attachment.mime!.match(/gif|apng|webp|avif/i)) {
        embed = <AnimatedGif img={img_props} which={m[0] as any} />
    } else {
        embed = reactElement('img', props.img.id, img_props);
    }

    return (
        <>
            {embed}

            {show && <LightBox src={props.img.src!} title={props.attachment.title || props.attachment.filename} size={props.attachment.size} onClose={() => setShow(false)} />}
        </>
    );
})