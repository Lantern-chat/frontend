export enum XHRMethod {
    GET,
    HEAD,
    POST,
    PUT,
    DELETE,
    OPTIONS,
}

interface XHRParameters {
    url: string,
    type?: XMLHttpRequestResponseType,
    body?: Document | BodyInit,
    method?: XHRMethod,
    timeout?: number,
    onprogress?: (this: XMLHttpRequest, ev: ProgressEvent) => any;
    headers?: { [header: string]: string },
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

            xhr.open(XHRMethod[params.method || XHRMethod.GET], params.url);

            if(params.headers) {
                for(let key in params.headers) {
                    xhr.setRequestHeader(key, params.headers[key]);
                }
            }

            xhr.send(params.body);
        } catch(e) {
            reject(e);
        }
    });
}

fetch.submitFormUrlEncoded = function(params: XHRParameters): Promise<XMLHttpRequest> {
    function urlencodeFormData(fd: FormData) {
        var params = new URLSearchParams();
        fd.forEach((value, key) => {
            typeof value === 'string' && params.append(key, value);
        });
        return params.toString();
    }

    if(params.body instanceof FormData) {
        params.headers = params.headers || {};
        params.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        params.body = urlencodeFormData(params.body);
    }

    return fetch(params);
}