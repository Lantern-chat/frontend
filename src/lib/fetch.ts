export enum XHRMethod {
    GET = "GET",
    HEAD = "HEAD",
    POST = "POST",
    PUT = "PUT",
    DELETE = "DELETE",
    CONNECT = "CONNECT",
    OPTIONS = "OPTIONS",
    TRACE = "TRACE",
    PATCH = "PATCH",
}

export interface XHRParameters {
    url: string,
    type?: XMLHttpRequestResponseType,
    body?: Document | XMLHttpRequestBodyInit,
    method?: XHRMethod,
    timeout?: number,
    bearer?: string,
    onprogress?: (this: XMLHttpRequest, ev: ProgressEvent) => any;
    headers?: { [header: string]: string },
    json?: any,
    upload?: boolean,
}

export function fetch(params: string | XHRParameters): Promise<XMLHttpRequest> {
    return new Promise((resolve, reject) => {
        try {
            if(typeof params === "string") {
                params = { url: params };
            }

            let xhr = new XMLHttpRequest();
            xhr.responseType = params.type || "json";

            if(params.timeout) { xhr.timeout = params.timeout; }

            xhr.onprogress = params.onprogress || null;
            xhr.onerror = e => reject(e);
            xhr.onload = () => { if(xhr.status >= 200 && xhr.status < 400) { resolve(xhr) } else { reject(xhr) } };

            if(params.upload) {
                xhr.upload.onerror = xhr.onerror;
                xhr.upload.onprogress = xhr.onprogress;
                xhr.upload.onload = xhr.onload;
            }

            xhr.open(params.method || "GET", params.url);

            if(params.headers) {
                for(let key in params.headers) {
                    xhr.setRequestHeader(key, params.headers[key]);
                }
            }

            if(params.bearer) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + params.bearer);
            }

            if(params.json) {
                params.body = JSON.stringify(params.json);
                xhr.setRequestHeader('Content-Type', 'application/json');
            }

            xhr.send(params.body);
        } catch(e) {
            reject(e);
        }
    });
}

fetch.submitFormUrlEncoded = function(params: XHRParameters): Promise<XMLHttpRequest> {
    if(params.body instanceof FormData) {
        params.headers = params.headers || {};
        params.headers['Content-Type'] = 'application/x-www-form-urlencoded';

        var encoded = new URLSearchParams();
        params.body.forEach((value, key) => {
            typeof value === 'string' && encoded.append(key, value);
        });

        params.body = encoded;
    }

    return fetch(params);
}