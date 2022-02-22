import classNames from "classnames";
import React, { useCallback, useContext, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { createStructuredSelector } from "reselect";

import { IS_MOBILE } from "lib/user_agent";
import { format_bytes } from "lib/formatting";
import { categorize_mime } from "lib/mime";

import { RootState } from "state/root";
import { Message, Attachment, UserPreferenceFlags, AttachmentFlags } from "state/models";
import { selectPrefsFlag } from "state/selectors/prefs";
import { message_attachment_url } from "config/urls";

import { MainContext, useClickEater } from "ui/hooks/useMainClick";
import { useInfiniteScrollIntersectionTrigger } from "ui/components/infinite_scroll2";

import { LightBox } from "ui/views/main/modals/lightbox/index_img";
import { AnimatedGif } from "ui/components/common/gif";
import { VectorIcon } from "ui/components/common/icon";
import { MimeIcon } from "ui/components/mime_icon";

import { SaveIcon } from "lantern-icons";

const attachment_selector = createStructuredSelector({
    use_mobile_view: (state: RootState) => state.window.use_mobile_view,
    mute_media: selectPrefsFlag(UserPreferenceFlags.MuteMedia),
    hide_unknown: selectPrefsFlag(UserPreferenceFlags.HideUnknown),
});

const SVG_REGEX = /svg|xml/i;
const TEXT_REGEX = /xml|text/i;

import "./attachment.scss";
export const MsgAttachment = React.memo(({ msg, attachment }: { msg: Message, attachment: Attachment }) => {
    let [error, setError] = useState(false),
        eat = useClickEater();

    let embed,
        { use_mobile_view, mute_media, hide_unknown } = useSelector(attachment_selector),
        mime = attachment.mime,
        id = attachment.id,
        flags = attachment.flags || 0,
        url = message_attachment_url(msg.room_id, id, attachment.filename),
        title = attachment.filename;


    if(mime && !error) {
        let common = {
            id,
            // alt or title can't be used here since they affect the UI negatively in some cases
            "aria-label": attachment.filename,
            "data-mime": attachment.mime,
            onContextMenu: eat,
            src: url,
            onError: () => setError(true),
        };

        switch(mime.slice(0, 5)) {
            case 'video': {
                if(hide_unknown && !(attachment.width && attachment.height)) break;

                if(IS_MOBILE) {
                    // the #t=0.0001 forces iOS Safari to preload the first frame and display that as a preview
                    common.src += '#t=0.0001';
                }

                // TODO: Record playback position for moving into a modal and continuing playback?
                embed = <VideoAttachment
                    vid={{ ...common, preload: "metadata", controls: true }}
                    attachment={attachment}
                    use_mobile_view={use_mobile_view}
                    mute_media={mute_media} />

                //embed = <video title={title} onContextMenu={eat} preload="metadata" src={url} controls onError={() => setError(true)} />;

                break;
            }
            case 'image': {
                if(hide_unknown && !(attachment.width && attachment.height)) break;

                if(!SVG_REGEX.test(mime) && attachment.size < (1024 * 1024 * 30)) {
                    embed = <ImageAttachment
                        img={common}
                        attachment={attachment}
                        use_mobile_view={use_mobile_view} />;
                }

                break;
            }
            case 'audio': {
                embed = <AudioAttachment
                    audio={common}
                    attachment={attachment}
                    mute_media={mute_media} />;

                break;
            }
        }
    }

    if(!embed) {
        let category = categorize_mime(attachment.filename, mime),
            size = format_bytes(attachment.size);

        title = title + ' (' + size + ')';

        // TODO: Add a warning if the content type is a script or program.
        embed = (
            <div className="ln-msg-attachment__generic">
                <div>
                    <MimeIcon category={category} />
                </div>
                <div className="ln-attachment-link ui-text">
                    <a target="__blank" title={title} href={url} onContextMenu={eat}>{attachment.filename}</a>
                    <span className="ln-attachment-size">{size}</span>
                </div>
                <a target="__blank" title={title} href={url + '?download'} className="ln-msg-attachment__download">
                    <VectorIcon src={SaveIcon} />
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

    let attachment_classes = classNames("ln-msg-attachment", { spoiler: (flags & AttachmentFlags.Spoiler) != 0 });

    return (
        <div className={attachment_classes}>
            {embed}
        </div>
    )
});

interface IImageAttachmentProps {
    img: React.ImgHTMLAttributes<HTMLImageElement>,
    attachment: Attachment,
    use_mobile_view: boolean,
}

function computeModifiedStyle(style: React.CSSProperties, atch: Attachment, use_mobile_view: boolean) {
    // mobile view has 100% max-width
    if(use_mobile_view) {
        if(atch.width && atch.height) {
            style.aspectRatio = (atch.width / atch.height) as any;
            style.width = 'auto';
        } else {
            // TODO: ?
            style.height = '100em';
        }
    } else {
        style.height = atch.height || '100em';
    }
}

const ImageAttachment = React.memo((props: IImageAttachmentProps) => {
    //embed = <img title={title} onContextMenu={eat} src={url} onError={() => setError(true)} />;
    let attachment = props.attachment,
        main = useContext(MainContext),
        [loaded, setLoaded] = useState(false),
        [show, setShow] = useState(false),
        ref = useRef<HTMLImageElement>(null),
        visible = useInfiniteScrollIntersectionTrigger(ref, { rootMargin: '150%' }),

        // on click of the image, show the lightbox modal
        onClick = useCallback((e: React.MouseEvent) => { main.clickAll(e); setShow(true); }, [main]),

        // parse mime type to see if it's obviously animated
        // TODO: Actually scan the file for animated flags
        animated_format = useMemo(() => { let m = attachment.mime?.match(/gif|apng|webp|avif/i); return m && m[0]; }, [attachment.mime]),

        // on load, replace height placeholder
        onLoad = useCallback(() => setLoaded(true), []),

        // add onClick and style tweaks
        img_props: React.ImgHTMLAttributes<HTMLImageElement> = {
            ...props.img,
            onClick,
            style: props.img.style || {},
            //loading: 'lazy'
        }, style = img_props.style!;

    if(!loaded) {
        computeModifiedStyle(style, attachment, props.use_mobile_view);
    }

    let embed;
    if(visible) {
        // NOTE: img_props here was created with an object spread,
        // so it's local and free to modify before passing along
        img_props.onLoad = onLoad;

        if(animated_format) {
            embed = <AnimatedGif img={img_props} which={animated_format as any} />
        } else {
            embed = <img {...img_props} />;
        }
    } else {
        // when not visible, show an empty placeholder img element with a large height
        // TODO: Replace this with blurhash
        embed = <img {...img_props} ref={ref} src={undefined} />;
    };

    return (
        <>
            {embed}

            {show && <LightBox
                src={props.img.src!}
                title={props.attachment.filename}
                size={props.attachment.size}
                onClose={() => setShow(false)}
            />}
        </>
    );
});

interface IVideoAttachmentProps {
    vid: React.VideoHTMLAttributes<HTMLVideoElement>,
    attachment: Attachment,
    use_mobile_view: boolean,
    mute_media: boolean,
}

const VideoAttachment = React.memo((props: IVideoAttachmentProps) => {
    let atch = props.attachment,
        [loaded, setLoaded] = useState(false),
        ref = useRef<HTMLVideoElement>(null),
        visible = useInfiniteScrollIntersectionTrigger(ref, { rootMargin: '150%' }),
        onLoad = useCallback(() => setLoaded(true), []),
        vid_props: React.VideoHTMLAttributes<HTMLVideoElement> = {
            ...props.vid,
            style: props.vid.style || {},
            muted: props.mute_media, // TODO: Don't unmute during playback when setting changes
        }, // clone props
        style = vid_props.style!;

    if(!loaded) {
        computeModifiedStyle(style, atch, props.use_mobile_view);
    }

    let embed;
    if(visible) {
        vid_props.onLoadedMetadata = vid_props.onLoad = onLoad;
        embed = <video {...vid_props} />;
    } else {
        // empty video element with the large size to act as a placeholder
        embed = <video {...vid_props} ref={ref} src={undefined} />;
    }

    return embed;
});

interface IAudioAttachmentProps {
    audio: React.AudioHTMLAttributes<HTMLAudioElement>,
    attachment: Attachment,
    mute_media: boolean,
}

const AudioAttachment = React.memo((props: IAudioAttachmentProps) => {
    return (
        <div className="ln-audio">
            <audio {...props.audio} controls muted={props.mute_media} />
        </div>
    );
});

if(__DEV__) {
    MsgAttachment.displayName = "MsgAttachment";
    ImageAttachment.displayName = "ImageAttachment";
    VideoAttachment.displayName = "VideoAttachment";
    AudioAttachment.displayName = "AudioAttachment";
}