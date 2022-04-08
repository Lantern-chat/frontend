import { createMemo, createSignal, JSX, Match, Show, Switch } from "solid-js";
import { useStructuredSelector } from "solid-mutant";

import { IS_MOBILE } from "lib/user_agent";
import { format_bytes } from "lib/formatting";
import { categorize_mime } from "lib/mime";

import { RootState } from "state/root";
import { Message, Attachment, UserPreferenceFlags, AttachmentFlags } from "state/models";
import { selectPrefsFlag } from "state/selectors/prefs";
import { message_attachment_url } from "config/urls";
import { createBytesFormatter } from "ui/hooks/createFormatter";

import { createRef } from "ui/hooks/createRef";
import { MainContext, createClickEater } from "ui/hooks/useMain";
import { Branch } from "ui/components/flow";
import { createInfiniteScrollIntersectionTrigger } from "ui/components/infinite_scroll";
import { px } from "ui/utils";

//import { LightBox } from "ui/views/main/modals/lightbox/index_img";
import { AnimatedGif } from "ui/components/common/gif";
import { VectorIcon } from "ui/components/common/icon";
import { MimeIcon } from "ui/components/mime";

import { SaveIcon } from "lantern-icons";

const SVG_REGEX = /svg|xml/i;
const TEXT_REGEX = /xml|text/i;

export interface IMsgAttachmentProps {
    msg: Message,
    attachment: Attachment,
}

import "./attachment.scss";
export function MsgAttachment(props: DeepReadonly<IMsgAttachmentProps>) {
    let state = useStructuredSelector({
        use_mobile_view: (state: RootState) => state.window.use_mobile_view,
        mute_media: selectPrefsFlag(UserPreferenceFlags.MuteMedia),
        hide_unknown: selectPrefsFlag(UserPreferenceFlags.HideUnknown),
    });

    let [errored, setErrored] = createSignal(false);

    let eat = createClickEater();

    let src = createMemo(() => message_attachment_url(props.msg.room_id, props.attachment.id, props.attachment.filename));

    let common = createMemo(() => {
        let a = props.attachment;
        return {
            id: a.id,
            "aria-label": a.filename,
            "data-mime": a.mime,
            onContextMenu: eat,
            onError: () => setErrored(true),
        };
    });

    let mime_prefix = createMemo(() => props.attachment.mime?.slice(0, 5));

    return (
        <div className="ln-msg-attachment" classList={{ 'spoiler': 0 != (props.msg.flags & AttachmentFlags.Spoiler) }}>
            <Show when={!errored()} fallback={<GenericAttachment {...props} />}>
                <Switch>
                    <Match when={mime_prefix() === 'image'}>
                        <ImageAttachment img={common()} src={src()} attachment={props.attachment} use_mobile_view={state.use_mobile_view} />
                    </Match>

                    <Match when={mime_prefix() === 'video'}>
                        <VideoAttachment vid={common()} src={src()} attachment={props.attachment} use_mobile_view={state.use_mobile_view} mute_media={state.mute_media} />
                    </Match>

                    <Match when={mime_prefix() === 'audio'}>
                        <AudioAttachment audio={common()} src={src()} attachment={props.attachment} mute_media={state.mute_media} />
                    </Match>
                </Switch>
            </Show>
        </div>
    )
}

function GenericAttachment(props: DeepReadonly<IMsgAttachmentProps>) {
    let url = createMemo(() => message_attachment_url(props.msg.room_id, props.attachment.id, props.attachment.filename));
    let title = createMemo(() => (props.attachment.filename + ' (' + props.attachment.size + ')'));
    let category = createMemo(() => categorize_mime(props.attachment.filename, props.attachment.mime));

    let eat = createClickEater();

    let bytes_formatter = createBytesFormatter();

    return (
        <div className="ln-msg-attachment__generic">
            <div>
                <MimeIcon category={category()} />
            </div>

            <div className="ln-attachment-link ui-text">
                <a target="__blank" title={title()} href={url()} onContextMenu={eat} textContent={props.attachment.filename} />
                <span className="ln-attachment-size" textContent={bytes_formatter(props.attachment.size)} />
            </div>

            <a target="__blank" title={title()} href={url() + '?download'} className="ln-msg-attachment__download">
                <VectorIcon src={SaveIcon} />
            </a>
        </div>
    )
}

interface IImageAttachmentProps {
    img: JSX.ImgHTMLAttributes<HTMLImageElement>,
    src: string,
    attachment: Attachment,
    use_mobile_view: boolean,
}

interface IVideoAttachmentProps {
    vid: JSX.VideoHTMLAttributes<HTMLVideoElement>,
    src: string,
    attachment: DeepReadonly<Attachment>,
    use_mobile_view: boolean,
    mute_media: boolean,
}

interface IAudioAttachmentProps {
    audio: JSX.AudioHTMLAttributes<HTMLAudioElement>,
    src: string,
    attachment: DeepReadonly<Attachment>,
    mute_media: boolean,
}

const TRIGGER_OPTS = { rootMargin: '150%' };

function ImageAttachment(props: IImageAttachmentProps) {
    let img = createRef<HTMLImageElement>();
    let [loaded, setLoaded] = createSignal(false);
    let visible = createInfiniteScrollIntersectionTrigger(img, TRIGGER_OPTS);

    let src = createMemo(() => visible() ? props.src : undefined);
    let style = createMemo(() => loaded() ? {} : computeModifiedStyle(props.img.style as JSX.CSSProperties || {}, props.attachment, props.use_mobile_view));

    let on_load = () => visible() && setLoaded(true);

    let animated_format = createMemo(() => props.attachment.mime?.match(/gif|apng|webp|avif/i)?.[0]);

    // Future work
    //createEffect(() => img.current?.classList.toggle('loading', !loaded()));

    return (
        <Branch>
            <Branch.If when={animated_format()}>
                {which => <AnimatedGif {...props.img}
                    src={src()}
                    which={which as any}
                    img={img}
                    onLoad={on_load}
                    style={style()} />
                }
            </Branch.If>

            <Branch.Else>
                <img {...props.img}
                    ref={img}
                    src={src()}
                    onLoad={on_load}
                    style={style()}
                />
            </Branch.Else>
        </Branch>
    )
}

function VideoAttachment(props: IVideoAttachmentProps) {
    let ref = createRef<HTMLVideoElement>();
    let [loaded, setLoaded] = createSignal(false);
    let visible = createInfiniteScrollIntersectionTrigger(ref, TRIGGER_OPTS);

    // use modified style if not loaded
    let style = createMemo(() => loaded() ? undefined :
        computeModifiedStyle(props.vid.style as JSX.CSSProperties || {}, props.attachment, props.use_mobile_view)
    );

    // the #t=0.0001 forces iOS Safari to preload the first frame and display that as a preview
    let src = createMemo(() => visible() ? (IS_MOBILE ? props.src + '#t=0.0001' : props.src) : undefined);

    let on_load = () => setLoaded(true);

    return (
        <video {...props.vid} src={src()} ref={ref}
            style={style()} muted={props.mute_media}
            onLoadedMetadata={on_load} onLoad={on_load}
            preload="metadata" controls
        />
    )
}

function AudioAttachment(props: IAudioAttachmentProps) {
    return (
        <div className="ln-audio">
            <audio {...props.audio} src={props.src} controls muted={props.mute_media} preload="none" />
        </div>
    );
}


function computeModifiedStyle(style: JSX.CSSProperties, attachment: Attachment, use_mobile_view: boolean): JSX.CSSProperties {
    // mobile view has 100% max-width
    if(use_mobile_view) {
        if(attachment.width && attachment.height) {
            return {
                'aspect-ratio': attachment.width / attachment.height,
                width: `min(100%, ${attachment.width}px)`,
            };
        } else {
            // TODO: ?
            return { height: '100em' };
        }
    } else {
        return { height: px(attachment.height) || '100em' };
    }
}