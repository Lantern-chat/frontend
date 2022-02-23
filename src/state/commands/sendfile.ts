import { fetch, XHRMethod } from "lib/fetch";
import { CLIENT } from "state/global";
import { Snowflake } from "state/models";
import { DispatchableAction, Type } from "state/root";

interface IFileParameters {
    file: File,
    preview?: string,
    width?: number,
    height?: number,
}

interface IFileUploadOptions {
    file: IFileParameters,

    onProgress(loaded: number, total: number): void;
    onError(xhr: XMLHttpRequest): void;
}

export function sendFile(opts: IFileUploadOptions): Promise<Snowflake | undefined> {
    let { file, preview, width, height } = opts.file,
        name = file.name,
        mime = file.type;

    return CLIENT.upload_stream({
        filename: name,
        mime,
        width,
        height,
        preview,
    }, file);
}

export function fetch_quota(): DispatchableAction {
    return async (dispatch, getState) => {
        let session = getState().user.session;
        if(!session) return;

        let res = await fetch({
            url: '/api/v1/file',
            method: XHRMethod.OPTIONS,
            bearer: session.auth,
        });

        if(res.status == 204) {
            let quota_used = parseInt(res.getResponseHeader('Upload-Quota-Used') || '0'),
                quota_total = parseInt(res.getResponseHeader('Upload-Quota-Total') || '0');

            dispatch({
                type: Type.UPDATE_QUOTA,
                quota_used,
                quota_total,
            });
        }
    };
}