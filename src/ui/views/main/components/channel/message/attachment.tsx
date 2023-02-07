import { createMemo, createSignal, For, JSX, Match, Show, Switch } from "solid-js";

import { IS_MOBILE } from "lib/user_agent";
import { categorize_mime } from "lib/mime";

import { Message, Attachment, AttachmentFlags } from "state/models";
import { usePrefs, UserPreferenceAccessors } from "state/contexts/prefs";
import { message_attachment_url } from "config/urls";

import { createRef } from "ui/hooks/createRef";
import { useLocale } from "ui/i18n";
import { useI18nContext } from "ui/i18n/i18n-solid";
import { MainContext, createClickEater } from "ui/hooks/useMain";
import { createInfiniteScrollIntersectionTrigger } from "ui/components/infinite_scroll";

import { cleanedEvent } from "ui/directives/bugs";
false && cleanedEvent;

import { px } from "ui/utils";

//import { LightBox } from "ui/views/main/modals/lightbox/index_img";
import { UIText } from "ui/components/common/ui-text";
import { AnimatedGif } from "ui/components/common/gif";
import { VectorIcon } from "ui/components/common/icon";
import { MimeIcon } from "ui/components/mime";
import { UserText } from "ui/components/common/ui-text-user";

import { Icons } from "lantern-icons";

const LARGE_THRESHOLD = 1024 * 1024 * (IS_MOBILE ? 10 : 30);

import "./attachment.scss";

const MAX_GRID_WIDTH = 4 / 100;

interface GridItem {
    attachment: Attachment,
    form: 's' | 'w' | 't'; // square/wide/tall
}

interface Grid {
    items: Array<GridItem>
}

// TODO: Improve this
function compute_grid(msg: Message, prefs: UserPreferenceAccessors): Grid | undefined {
    if(msg.attachments && msg.attachments.length > 2 && !prefs.LowBandwidthMode()) {
        let items: GridItem[] = [], is_mobile = prefs.UseMobileView(), continous_squares = 0, total_wide = 0;

        for(let attachment of msg.attachments) {
            if(!attachment.mime?.startsWith("image/")) {
                return;
            }

            let ar = attachment.width! / attachment.height!;
            let form: "s" | "w" | "t" = ar > 1.5 ? 'w' : ar < 0.5 ? 't' : 's';

            let unknown = prefs.HideUnknown() && !(attachment.width && attachment.height);
            let large = attachment.size >= LARGE_THRESHOLD;

            if((unknown || large) && form != "w") {
                return;
            }

            if(form == "s") {
                continous_squares++;
            } else {
                // odd, would cause gap
                if(is_mobile && (continous_squares & 1) == 1) {
                    return;
                }

                if(form == "w") {
                    total_wide++;
                }

                continous_squares = 0;
            }

            items.push({ attachment, form });
        }

        // if they're mostly all wide anyway, just show them linearly
        if(is_mobile && (total_wide / items.length) >= 0.65) return;

        return { items };
    }

    return;
}

export function Attachments(props: { msg: Message }) {
    let prefs = usePrefs();

    return (
        <Show keyed when={prefs.ShowAttachmentGrid() && compute_grid(props.msg, prefs)}
            fallback={(
                <For each={props.msg.attachments}>
                    {attachment => <MsgAttachment msg={props.msg} attachment={attachment} prefs={prefs} />}
                </For>
            )}
        >
            {(grid: Grid) => <AttachmentGrid msg={props.msg} grid={grid} prefs={prefs} />}
        </Show>
    )
}

export function AttachmentGrid(props: { msg: Message, grid: Grid, prefs: UserPreferenceAccessors }) {
    return (
        <div class="ln-msg-attachment--grid">
            <For each={props.grid.items}>
                {(item) => (
                    <div class="ln-msg-attachment--grid-item"
                        classList={{
                            's': item.form == 's',
                            'w': item.form == 'w',
                            't': item.form == 't',
                        }}
                    >
                        <MsgAttachment msg={props.msg} attachment={item.attachment} prefs={props.prefs} />
                    </div>
                )}
            </For>
        </div>
    )
}

export interface IMsgAttachmentProps {
    msg: Message,
    attachment: Attachment,
    prefs: UserPreferenceAccessors,
}

export function MsgAttachment(props: IMsgAttachmentProps) {
    const { LL } = useI18nContext();

    let prefs = props.prefs;

    let [errored, setErrored] = createSignal(false);

    let eat = createClickEater();

    let src = () => message_attachment_url(props.msg.room_id, props.attachment.id, props.attachment.filename);

    let common = () => {
        let a = props.attachment;
        return {
            id: a.id,
            "aria-label": a.filename,
            "data-mime": a.mime,
            onContextMenu: eat,
            onError: () => setErrored(true),
            width: a.width,
            height: a.height,
        };
    };

    let mime_prefix = createMemo(() => props.attachment.mime?.slice(0, 5));

    let unknown = () => prefs.HideUnknown() && !(props.attachment.width && props.attachment.height);
    let large = () => props.attachment.size >= LARGE_THRESHOLD;

    let [revealed, setRevealed] = createSignal(false);
    let spoilered = createMemo(() => (props.attachment.filename.startsWith("SPOILER_") || 0 != (props.msg.flags & AttachmentFlags.Spoiler)) && !revealed());

    return (
        <div class="ln-msg-attachment" classList={{ 'spoiler': spoilered() }} onClick={() => setRevealed(true)}>
            <Show when={!errored() && !prefs.LowBandwidthMode()} fallback={<GenericAttachment {...props} />}>
                <Switch fallback={<GenericAttachment {...props} />}>
                    <Match when={mime_prefix() === 'image' && !unknown() && !large()}>
                        {() => prefs.ShowMediaMetadata() && <MediaMetadata {...props} />}
                        <ImageAttachment img={common()} src={src()} prefs={prefs} attachment={props.attachment} />
                    </Match>

                    <Match when={mime_prefix() === 'video' && !unknown()}>
                        {() => prefs.ShowMediaMetadata() && <MediaMetadata {...props} />}
                        <VideoAttachment vid={common()} src={src()} prefs={prefs} attachment={props.attachment} />
                    </Match>

                    <Match when={mime_prefix() === 'audio'}>
                        {() => prefs.ShowMediaMetadata() && <MediaMetadata {...props} />}
                        <AudioAttachment audio={common()} src={src()} prefs={prefs} attachment={props.attachment} />
                    </Match>
                </Switch>

                {() => spoilered() && (
                    <span class="spoiler-label" title={LL().main.SPOILER_TITLE()}>
                        <UIText text={LL().main.SPOILER(0)} />
                    </span>
                )}
            </Show>
        </div>
    )
}

function MediaMetadata(props: IMsgAttachmentProps) {
    let { f } = useLocale();

    let metadata = () => {
        let { mime, size } = props.attachment;
        let bytes = f().bytes(size);

        // strip "image/" prefix on mobile
        if(mime && props.prefs.UseMobileView()) {
            mime = mime.replace(/^image\//, '');
        }

        return '(' + (mime ? (mime + ' - ' + bytes) : bytes) + ')';
    };

    return (
        <div class="ui-text ln-attachment-metadata ln-attachment-metadata--full" title={props.attachment.filename}>
            <span><UserText text={props.attachment.filename} /></span>&nbsp;{metadata()}
        </div>
    );
}

function GenericAttachment(props: IMsgAttachmentProps) {
    const prefs = props.prefs, { f } = useLocale();
    let url = createMemo(() => message_attachment_url(props.msg.room_id, props.attachment.id, props.attachment.filename));
    let title = createMemo(() => (props.attachment.filename + ' (' + props.attachment.size + ')'));

    let eat = createClickEater();

    let metadata = () => {
        let bytes = f().bytes(props.attachment.size);
        if(props.attachment.mime && prefs.ShowMediaMetadata()) {
            return props.attachment.mime + ' - ' + bytes;
        } else {
            return bytes;
        }
    };

    return (
        <div class="ln-msg-attachment__generic">
            <div title={props.attachment.mime}>
                <MimeIcon category={categorize_mime(props.attachment.filename, props.attachment.mime)} />
            </div>

            <div class="ln-attachment-link ui-text">
                <a target="__blank" title={title()} href={url()} onContextMenu={eat} textContent={props.attachment.filename} />
                <span class="ln-attachment-metadata" textContent={metadata()} />
            </div>

            <a target="__blank" title={title()} href={url() + '?download'} class="ln-msg-attachment__download">
                <VectorIcon id={Icons.Save} />
            </a>
        </div>
    );
}

interface IImageAttachmentProps {
    prefs: UserPreferenceAccessors,
    img: JSX.ImgHTMLAttributes<HTMLImageElement>,
    src: string,
    attachment: Attachment,
}

interface IVideoAttachmentProps {
    prefs: UserPreferenceAccessors,
    vid: JSX.VideoHTMLAttributes<HTMLVideoElement>,
    src: string,
    attachment: Attachment,
}

interface IAudioAttachmentProps {
    prefs: UserPreferenceAccessors,
    audio: JSX.AudioHTMLAttributes<HTMLAudioElement>,
    src: string,
    attachment: Attachment,
}

const TRIGGER_OPTS = { rootMargin: '150%' };

function ImageAttachment(props: IImageAttachmentProps) {
    const prefs = props.prefs;
    let img = createRef<HTMLImageElement>();
    let [loaded, setLoaded] = createSignal(false);
    let visible = createInfiniteScrollIntersectionTrigger(img, TRIGGER_OPTS);

    let src = () => visible() ? props.src : undefined;
    let style = () => loaded() ? {} : computeModifiedStyle(props.img.style as JSX.CSSProperties || {}, props.attachment, prefs.UseMobileView());

    let on_load = () => visible() && setLoaded(true);

    // Future work
    //createEffect(() => img.current?.classList.toggle('loading', !loaded()));

    return () => {
        //let animated_format = props.attachment.mime?.match(/gif|apng|webp|avif/i)?.[0];

        return (
            <img {...props.img}
                ref={img}
                src={src()}
                use:cleanedEvent={[
                    ['load', on_load],
                    ['loadedmetadata', on_load]
                ]}
                data-loaded={loaded()}
                style={style()}
            />
        );

        // animated_format ? (
        //     <AnimatedGif {...props.img}
        //         src={src()}
        //         which={animated_format as any}
        //         img={img}
        //         onLoad={on_load}
        //         onLoadedMetadata={on_load}
        //         style={style()} />
        // )
    };
}

function VideoAttachment(props: IVideoAttachmentProps) {
    const prefs = props.prefs;

    let ref = createRef<HTMLVideoElement>();
    let [loaded, setLoaded] = createSignal(false);
    let visible = createInfiniteScrollIntersectionTrigger(ref, TRIGGER_OPTS);

    // use modified style if not loaded
    let style = () => loaded() ? undefined :
        computeModifiedStyle(props.vid.style as JSX.CSSProperties || {}, props.attachment, prefs.UseMobileView());

    // the #t=0.0001 forces iOS Safari to preload the first frame and display that as a preview
    let src = () => visible() ? (IS_MOBILE ? props.src + '#t=0.0001' : props.src) : undefined;

    let on_load = () => setLoaded(true);

    return (
        <video {...props.vid} src={src()} ref={ref}
            style={style()} muted={prefs.MuteMedia()}
            onLoadedMetadata={on_load} on:load={on_load}
            preload="metadata" controls
        />
    )
}

function AudioAttachment(props: IAudioAttachmentProps) {
    const prefs = props.prefs;

    return (
        <div class="ln-audio">
            <audio {...props.audio} src={props.src} controls muted={prefs.MuteMedia()} preload="none" />
        </div>
    );
}


function computeModifiedStyle(style: JSX.CSSProperties, attachment: Attachment, use_mobile_view: boolean): JSX.CSSProperties {
    // mobile view has 100% max-width
    if(use_mobile_view) {
        if(attachment.width && attachment.height) {
            return {
                '--aspect-ratio': (attachment.width / attachment.height).toString(),
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