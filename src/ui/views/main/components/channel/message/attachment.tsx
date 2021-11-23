import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { IS_MOBILE } from "lib/user_agent";
import { format_bytes } from "lib/formatting";

import { Message, Attachment } from "state/models";
import { message_attachment_url } from "config/urls";

import { MainContext, useClickEater, useMainClick, useSimpleToggleOnClick } from "ui/hooks/useMainClick";
import { InfiniteScrollContext } from "ui/components/infinite_scroll2";

import { reactElement } from "ui/components/common/markdown/markdown";

import { LightBox } from "ui/views/main/modals/lightbox";
import { AnimatedGif } from "ui/components/common/gif";
import { Glyphicon } from "ui/components/common/glyphicon";
import { MimeIcon } from "ui/components/mime_icon";

import SaveIcon from "icons/glyphicons-pro/glyphicons-basic-2-4/svg/individual-svg/glyphicons-basic-199-save.svg";

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
                <a target="__blank" title={title} href={url + '?download'} className="ln-msg-attachment__download">
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
        [visible, setVisible] = useState(false),
        [loaded, setLoaded] = useState(false),
        [show, setShow] = useState(false),
        ref = useRef<HTMLImageElement>(null),

        // on click of the image, show the lightbox modal
        onClick = useCallback((e: React.MouseEvent) => { main.clickAll(e); setShow(true); }, [main]),

        // parse mime type to see if it's obviously animated
        // TODO: Actually scan the file for animated flags
        animated_format = useMemo(() => { let m = props.attachment.mime?.match(/gif|apng|webp|avif/i); return m && m[0]; }, [props.attachment.mime]),
        // on load, replace height placeholder
        onLoad = useCallback(() => setLoaded(true), [ref.current]),
        // add onClick and style tweaks
        img_props: React.ImgHTMLAttributes<HTMLImageElement> = { ...props.img, onClick, style: loaded ? props.img.style : { height: '100em' } },
        // tap into InfiniteScroll for a reference to the container element, used for the intersection observer bounds
        ifs = useContext(InfiniteScrollContext),
        embed;

    useEffect(() => {
        let img = ref.current;
        if(img && !visible) {
            let observer = new IntersectionObserver((entries) => {
                if(entries[0].intersectionRatio > 0) { setVisible(true); }
            }, { root: ifs?.containerRef.current, rootMargin: '100%' });

            observer.observe(img);
            return () => { observer.disconnect(); };
        }

        return;
    }, [ref.current, visible, ifs]);

    if(visible) {
        img_props.onLoad = onLoad;

        if(animated_format) {
            embed = <AnimatedGif img={img_props} which={animated_format as any} />
        } else {
            embed = <img {...img_props} />;
        }
    } else {
        // when not visible, show an empty placeholder img element with a large height
        embed = <img {...img_props} ref={ref} src={undefined} />;
    };

    return (
        <>
            {embed}

            {show && <LightBox
                src={props.img.src!}
                title={props.attachment.title || props.attachment.filename}
                size={props.attachment.size}
                onClose={() => setShow(false)}
            />}
        </>
    );
})