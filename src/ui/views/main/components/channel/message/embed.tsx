import { encodeUTF8toBase64 } from "client-sdk/src/lib/base64";
import { Icons } from "lantern-icons";
import { unpack_rgb } from "lib/color";
import { IS_MOBILE } from "lib/user_agent";
import { Accessor, createEffect, createSelector, createSignal, For, Match, on, onMount, Setter, Show, Switch } from "solid-js";
import { usePrefs } from "state/contexts/prefs";
import { Embed, EmbedAuthor, EmbedFlags, EmbedMedia, EmbedProvider, Message } from "state/models";
import { EmbedType } from "state/models";
import { VectorIcon } from "ui/components/common/icon";
import { UIText } from "ui/components/common/ui-text";
import { ConstShow } from "ui/components/flow";
import { Atom, createAtom } from "ui/hooks/createAtom";
import { useI18nContext } from "ui/i18n/i18n-solid";
import type { IMessageProps } from "./common";

import "./embed.scss";

interface EmbedProps {
    msg: Message,
    embed: Embed,
}

export function Embeds(props: { msg: Message }) {
    return (
        <For each={props.msg.embeds}>
            {embed => <Embedded msg={props.msg} embed={embed} />}
        </For>
    )
}

const ELLIPSIS = "…";

const MAX_TITLE_LEN = 240;
const MAX_AUTHOR_LEN = 120;
const MAX_DESCRIPTION_LEN = 600;
const MAX_PROVIDER_LEN = 80;

const COMPLEX_FIELDS: Array<keyof Embed> = ["t", "d", "au", "obj", "fields", "footer", "thumb"];

export function is_simple_embed(embed: Embed): boolean {
    // embeds with no complex fields can be rendered as-is
    let simple = true;
    for(let key in embed) {
        if(COMPLEX_FIELDS.includes(key as any)) {
            simple = false;
            break;
        }
    }
    return simple;
}

export function should_hide_message(props: IMessageProps) {
    let msg = props.msg.msg, embeds = msg.embeds, content = msg.content;

    if(content && embeds?.length) {
        let all_urls = '';

        for(let embed of embeds) {
            if(!is_simple_embed(embed)) {
                return false;
            }

            if(embed.u) {
                all_urls += embed.u + ' ';
            }
        }

        all_urls = all_urls.trimEnd();

        if(content == all_urls) {
            return true;
        }
    }

    return !content;
}


function trim_text(text: string | undefined, max_len: number): string | undefined {
    if(text && text.length > max_len) {
        text = text.slice(0, max_len)!;

        // run backwards in string to find recent punctuation
        for(let i = text.length - 1; i > 0; i--) {
            if(/[\s,.]/.test(text.charAt(i))) {
                text = text.slice(0, i);
                break;
            };
        }

        // trim any remaining
        text = text.replace(/[\s,.]+$/, '') + ELLIPSIS;
    }

    return text;
}

type Dims = Atom<[width: number, height: number]>;

function Embedded(props: EmbedProps) {
    const prefs = usePrefs(), { LL } = useI18nContext();

    let dim: Dims = createAtom<[width: number, height: number]>([0, 1]);

    let width = () => {
        if(prefs.UseMobileView()) {
            return '100%';
        }

        // embeds with no complex fields can be rendered as-is
        if(is_simple_embed(props.embed)) {
            return 'fit-content';
        }

        let use_smaller = prefs.SmallerAttachments(),
            height = use_smaller ? 20 : 30,
            [w, h] = dim(),
            ar = (w / h) || 1.5;

        // small images
        if(w < 600 && !use_smaller) {
            ar *= 0.5;
        }

        let min_width = 30;

        // give link-only enough room for title/description
        if(props.embed.ty == EmbedType.Link) {
            min_width = 50;
        }

        return `min(70%, max(${min_width}em, ${height * ar + 2}em))`;
    };

    let [spoilered, setSpoilered] = createSignal(!!(props.embed.f! & EmbedFlags.Spoiler));

    return (
        <div class="ln-embed ui-text"
            style={{
                '--embed-ac': props.embed.ac != null ? '#' + props.embed.ac.toString(16) : 'var(--ln-accent-color)',
                'width': width(),
                'max-width': prefs.UseMobileView() ? '100%' : '70%'
            }}
        >
            {/* <span>{dim().join(', ')} = {width()}</span> */}
            {/* FLOATING */}
            <ConstShow when={props.embed.thumb &&
                !(props.embed.img && props.embed.vid && props.embed.vid.m == "text/html")}
            >
                <div class="ln-embed__thumb">
                    <EmbeddedMediaSingle media={props.embed.thumb!} />
                </div>
            </ConstShow>

            <ConstShow keyed when={props.embed.au}>
                {author => <EmbeddedAuthor author={author} />}
            </ConstShow>

            <a target="_blank" rel="noreferrer" class="ln-embed__title" href={props.embed.u}>
                {trim_text(props.embed.t, MAX_TITLE_LEN)}
            </a>
            <div class="ln-embed__desc">{trim_text(props.embed.d, MAX_DESCRIPTION_LEN)}</div>

            <div class="ln-embed__media" >
                <EmbeddedMedia {...props} dim={dim} />
            </div>

            <ConstShow when={spoilered()}>
                <div class="ln-embed__spoiler" title={LL().main.SPOILER_TITLE()} onClick={() => setSpoilered(false)}>
                    <UIText text={LL().main.SPOILER(0)} />
                </div>
            </ConstShow>

            <ConstShow when={props.embed.p} keyed>
                {provider => <EmbeddedProvider pro={provider} u={props.embed.u} />}
            </ConstShow>
        </div>
    )
}

const CDN_URL = (window.config.secure ? 'https' : 'http') + `://${window.config.cdn}/`;

function make_camo_url(media: EmbedMedia | undefined, fallback?: boolean): string | undefined {
    let url = media?.u;

    if(url && window.config.camo && !url.startsWith(CDN_URL) && media!.s) {
        // encode to base64 and convert to url-safe
        let ext = url.match(/\.\w+($|\?)/), encoded_url = encodeUTF8toBase64(url).replace(/[=+\/]/g, s => {
            switch(s) {
                case '+': return '-';
                case '/': return '_';
                default: return '';
            }
        });

        url = `${CDN_URL + (fallback ? 'camo2' : 'camo')}/${encoded_url}/${media!.s}${ext ? ext[0] : ''}`;
    }

    return url;
}

function EmbeddedAuthor(props: { author: EmbedAuthor }) {
    let url = () => {
        let url = props.author.u, name = props.author.n;

        // rare, but I've seen sites shove urls into the name parameter
        if(!url && /^https?:\/\//.test(name)) {
            url = name;
        }

        return url;
    };

    return (
        <div class="ln-embed__author">
            <ConstShow keyed when={props.author.i}>
                {media => <EmbeddedMediaSingle media={media} />}
            </ConstShow>

            <ConstShow keyed when={url()} fallback={
                <span>{trim_text(props.author.n, MAX_AUTHOR_LEN)}</span>
            }>
                {url => (
                    <a target="_blank" rel="noreferrer" href={url}>
                        {trim_text(props.author.n, MAX_AUTHOR_LEN)}
                    </a>
                )}
            </ConstShow>
        </div>
    )
}

function EmbeddedProvider(props: { pro: EmbedProvider, u: string | undefined }) {
    let name = () => props.pro.n || (props.pro.u || props.u)?.match(/^https?:\/\/(.*?)[\/$]/)?.[1];

    return (
        <div class="ln-embed__provider">
            <ConstShow when={props.pro.u} fallback={
                <span>{trim_text(name(), MAX_PROVIDER_LEN)}</span>
            } >
                <a target="_blank" rel="noreferrer" href={props.pro.u}>
                    {trim_text(name(), MAX_PROVIDER_LEN)}
                </a>
            </ConstShow>

            <ConstShow keyed when={props.pro.i}>
                {media => <EmbeddedMediaSingle media={media} />}
            </ConstShow>
        </div>
    )
}

function EmbeddedMediaSingle(props: { media: EmbedMedia }) {
    return () => {
        let media = props.media, m = media.m || 'image/';

        if(m.startsWith('video/')) {
            return <EmbeddedVideo media={media} />;
        }
        if(m.startsWith('image/')) {
            return <EmbeddedImg media={media} />
        }

        return null;
    }
}

function EmbeddedMedia(props: EmbedProps & { dim?: Dims }) {
    let ty = createSelector(() => props.embed.ty);

    return (
        <Switch>
            <Match when={ty(EmbedType.Img) && props.embed.img}>
                <EmbeddedImg url={props.embed.u} media={props.embed.img!} dim={props.dim} />
            </Match>

            <Match when={ty(EmbedType.Audio) && props.embed.audio}>
                <EmbeddedAudio media={props.embed.audio!} />
            </Match>

            <Match when={ty(EmbedType.Vid) && props.embed.vid}>
                <ConstShow when={props.embed.vid!.m == "text/html" && props.embed.vid!.u} fallback={
                    <EmbeddedVideo url={props.embed.u} media={props.embed.vid!} dim={props.dim} />
                }>
                    <EmbeddedHtmlWithConsent media={props.embed.vid!} embed={props.embed} dim={props.dim} />
                </ConstShow>
            </Match>

            <Match when={ty(EmbedType.Html) && props.embed.obj}>
                <EmbeddedHtmlWithConsent media={props.embed.obj!} embed={props.embed} dim={props.dim} />
            </Match>
        </Switch>
    )
}

function EmbeddedHtmlWithConsent(props: { media: EmbedMedia, embed: Embed, dim?: Dims }) {
    const prefs = usePrefs();

    let [playing, setPlaying] = createSignal(false);

    createEffect(on(prefs.UseMobileView, () => {
        setPlaying(false);
    }));

    return (
        <Show when={!playing()} fallback={<EmbeddedHtml media={props.media} dim={props.dim} />}>
            <span class="ln-embed__consent" />

            <ConstShow keyed when={props.embed.img || (is_large_media(props.embed.thumb) ? props.embed.thumb : undefined)} fallback={
                <EmbeddedHtmlWithConsentFallbackImg media={props.media} dim={props.dim} />
            }>
                {img => <EmbeddedImg url={props.embed.u} media={img} dim={props.dim} />}
            </ConstShow>

            <div class="ln-embed__play-icon" onClick={() => setPlaying(true)}>
                <VectorIcon id={Icons.Play} />
            </div>
        </Show>
    );
}

function EmbeddedHtmlWithConsentFallbackImg(props: { media: EmbedMedia, dim?: Dims }) {
    first_dims(props.media, props.dim);

    return (
        <div class="ln-embed__play-bg" style={{
            'aspect-ratio': aspect_ratio(props.media, props.dim)
        }}><div /></div>
    )
}

function aspect_ratio(media: undefined | EmbedMedia, dim?: Dims): number | undefined {
    if(dim) {
        let [width, height] = dim();
        return width / height;
    }

    return (media?.w || media?.h) ? ((media.w! | 1) / (media.h! | 1)) : undefined;
}

function first_dims(m: EmbedMedia, dim: undefined | Dims) {
    if(dim && (m.w || m.h)) {
        dim([(m.w! || m.h!) | 1, (m.h! || m.w!) | 1]);
    }
}

function EmbeddedImg(props: { url?: string, media: EmbedMedia, dim?: Dims, onClick?: (() => void) }) {
    let [errored, setErrored] = createSignal(false);

    first_dims(props.media, props.dim);

    let on_load = (ev: Event) => {
        let el = ev.currentTarget as HTMLImageElement;
        props.dim!([el.naturalWidth, el.naturalHeight]);
    };

    return (
        <img src={make_camo_url(props.media, errored())} onError={() => setErrored(true)}
            width={props.media.w}
            height={props.media.h}
            onLoad={props.dim ? on_load : undefined}
            onClick={props.onClick} style={{ 'aspect-ratio': aspect_ratio(props.media, props.dim) }}
        />
    );
}

function EmbeddedVideo(props: { url?: string, media: EmbedMedia, dim?: Dims, onClick?: (() => void) }) {
    const prefs = usePrefs();

    let [errored, setErrored] = createSignal(false);

    // the #t=0.0001 forces iOS Safari to preload the first frame and display that as a preview
    let src = () => {
        let src = make_camo_url(props.media, errored());
        return IS_MOBILE ? src + '#t=0.0001' : src
    };

    first_dims(props.media, props.dim);

    return (
        <video preload="metadata" controls muted={prefs.MuteMedia()}
            src={src()} onError={() => setErrored(true)}
            width={props.media.w}
            height={props.media.h}
            onClick={props.onClick} style={{ 'aspect-ratio': aspect_ratio(props.media, props.dim) }}
        />
    );
}

function EmbeddedAudio(props: { url?: string, media: EmbedMedia, onClick?: (() => void) }) {
    const prefs = usePrefs();

    let [errored, setErrored] = createSignal(false);

    return (
        <audio preload="metadata" controls muted={prefs.MuteMedia()}
            src={make_camo_url(props.media, errored())}
            onError={() => setErrored(true)}
        />
    );
}

function EmbeddedHtml(props: { media: EmbedMedia, dim?: Dims }) {
    const prefs = usePrefs();

    let [errored, setErrored] = createSignal(false);

    let url = () => {
        let url = props.media.u;
        if(url) {
            url += (url.includes("?") ? "&" : "?") + `autoplay=1&parent=${window.location.hostname}`;
            if(prefs.MuteMedia()) {
                url += '&mute=1';
            }
        }
        return url;
    };

    first_dims(props.media, props.dim);

    return (
        <ConstShow when={!errored()}>
            <iframe src={url()} style={{ 'aspect-ratio': aspect_ratio(props.media, props.dim) }}
                on:error={() => setErrored(true)}
                width={props.dim?.()[0]}
                height={props.dim?.()[1]}
                allowfullscreen
                sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
            />
        </ConstShow>
    );
}