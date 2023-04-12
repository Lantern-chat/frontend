import { createEffect, createMemo, createSignal, onCleanup, onMount, splitProps } from "solid-js";
import { SetController } from "ui/hooks/createController";

export interface ExecuteResponse {
    response: string;
    key: string;
}

export interface HCaptchaController {
    reset(): void;
    render(): void;
    remove(): void;
    execute(opts: { async: true }): Promise<ExecuteResponse>;
    execute(opts?: { async: false }): void;
    execute(opts?: { async: boolean }): Promise<ExecuteResponse> | void;
}

export interface HCaptchaProps {
    onVerify?: (token: string, ekey: string) => any;

    onExpire?: () => any;
    onOpen?: () => any;
    onClose?: () => any;
    onChalExpired?: () => any;
    onError?: (event: string) => any;
    onLoad?: () => any;

    id?: string;

    setController: SetController<HCaptchaController>,

    params: HCaptchaParams,
}

interface HCaptchaState {
    isApiReady: boolean;
    isRemoved: boolean;
    elementId: string;
    captchaId: string;
}

let onLoadListeners: Array<() => void> = [];
let apiScriptRequested = false;

interface HCaptchaParams {
    apihost?: string,
    assethost?: string,
    endpoint?: string,
    hl?: string,
    host?: string,
    imghost?: string,
    recaptchacompat?: "off" | "on",
    reportapi?: string,
    sentry?: string,
    custom?: string,
    sitekey: string;
    size?: "normal" | "compact" | "invisible";
    theme?: "light" | "dark";
    tabIndex?: number;
}

const HCAPTCHA_ON_LOAD: string = "hcaptchaOnLoad";

function mountCaptchaScript(params: HCaptchaParams) {
    apiScriptRequested = true;
    // Create global onload callback
    (window as any)[HCAPTCHA_ON_LOAD] = () => {
        // Iterate over onload listeners, call each listener
        onLoadListeners = onLoadListeners.filter(listener => {
            listener();
            return false;
        });
    };

    if(typeof params.recaptchacompat === "undefined") {
        params.recaptchacompat = "off";
    }

    const domain = params.apihost || "https://js.hcaptcha.com";
    delete params.apihost;

    const script = document.createElement("script");
    script.src = `${domain}/1/api.js?render=explicit&onload=${HCAPTCHA_ON_LOAD}`;
    script.async = true;

    // clean params
    Object.keys(params).forEach(key =>
        !(params[key as keyof HCaptchaParams] || params[key as keyof HCaptchaParams] as any === false) &&
        delete params[key as keyof HCaptchaParams]
    );

    const query = new URLSearchParams(params as any).toString();
    script.src += query !== "" ? `&${query}` : "";

    document.head.appendChild(script);
}

export function HCaptcha(props: HCaptchaProps) {
    let div: HTMLDivElement | undefined;

    let [isApiReady, setIsApiReady] = createSignal(typeof hcaptcha !== "undefined");

    let [isRemoved, setIsRemoved] = createSignal(false);
    let [captchaId, setCaptchaId] = createSignal("");

    let isReady = createMemo(() => isApiReady() && !isRemoved());

    let onGeneric = (cb?: () => void) => () => {
        if(isReady()) { cb?.() }
    };

    let onOpen = onGeneric(props.onOpen);
    let onClose = onGeneric(props.onClose);
    let onExpire = onGeneric(props.onExpire);
    let onChalExpired = onGeneric(props.onChalExpired);

    let onError = (event: string) => {
        if(isReady()) {
            hcaptcha.reset(captchaId());
            props.onError?.(event);
        }
    };

    let onSubmit = (event: string) => {
        if(isReady()) {
            let id = captchaId();
            let token = hcaptcha.getResponse(id);
            let ekey = hcaptcha.getRespKey(id);

            props.onVerify?.(token, ekey);
        }
    }

    let renderCaptcha = (onReady?: () => void) => {
        if(!isApiReady()) return;

        let params = Object.assign({
            "open-callback": onOpen,
            "close-callback": onClose,
            "error-callback": onError,
            "chalexpired-callback": onChalExpired,
            "expired-callback": onExpire,
            "callback": onSubmit,
        }, props.params);

        let id = hcaptcha.render(div, params);

        setIsRemoved(false);
        setCaptchaId(id);
        onReady?.();
    };

    let onLoad = () => {
        setIsApiReady(true);
        renderCaptcha(() => props.onLoad?.());
    };

    onMount(() => {
        if(isApiReady()) { renderCaptcha(); }
        else {
            if(!apiScriptRequested) {
                mountCaptchaScript(props.params || {});
            }

            onLoadListeners.push(onLoad);
        }

        onCleanup(() => {
            if(isReady()) {
                let id = captchaId();
                hcaptcha?.reset(id);
                hcaptcha?.remove(id);
            }
        });
    });

    let reset = () => {
        if(isReady()) {
            hcaptcha.reset(captchaId());
        }
    };

    let remove = (cb?: () => void) => {
        if(isApiReady()) {
            setIsRemoved(true);
            hcaptcha.remove(captchaId());
            cb?.();
        }
    };

    let execute = (opts?: { async: boolean }) => {
        if(isReady()) {
            return hcaptcha.execute(captchaId(), opts);
        }
    };

    createEffect(() => {
        props.setController({
            reset,
            remove,
            render: renderCaptcha,
            execute,
        });
    });


    return (<div ref={div} id={props.id} />);
}