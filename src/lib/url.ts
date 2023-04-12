export interface UrlParts {
    path: string[],
    dir: boolean,
    query?: string,
    hash?: string,
}

const ROOT: UrlParts = { path: [], dir: true };

const URL_REGEX: RegExp = /^((\/[^\/#?]+)+)(\/?)(\?[^#]+)?(#.*)?$/;

export function parseUrl(url: string): UrlParts | null {
    if(url == "/") return ROOT;
    let m = URL_REGEX.exec(url);
    return m == null ? null : {
        path: m[1].split("/").slice(1),
        dir: m[3] == "/",
        query: m[4],
        hash: m[5],
    };
}

export function matchesUrlPathPrefix(url: UrlParts, prefix: string[]): boolean {
    for(let i = 0; i < prefix.length; i++) {
        if(url.path[i] != prefix[i]) return false;
    }
    return true;
}

export function extractNamed<T, K extends keyof T, V extends T[K] & string>(url: UrlParts, names: K[]): Partial<T> {
    let res: Partial<T> = {};
    for(let i = 0; i < Math.min(url.path.length, names.length); i++) {
        res[names[i]] = url.path[i] as V;
    }
    return res;
}