import { encodeBase64, encodeUTF8toBase64 } from "lib/base64";
import { crc32_buf as crc32 } from "lib/crc32";
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

export async function sendFileOld(bearer: string, opts: IFileUploadOptions): Promise<Snowflake | undefined> {
    let { file, preview, width, height } = opts.file,
        size = file.size,
        name = file.name,
        mime = file.type;

    let res = await fetch({
        url: '/api/v1/file',
        method: XHRMethod.POST,
        bearer,
        json: {
            filename: name,
            mime,
            size,
            width,
            height,
            preview,
        }
    });

    let file_id: Snowflake | null = res.getResponseHeader('Location');
    if(!file_id) return;

    __DEV__ && console.log("File created! Uploading now with at", file_id);


    let chunk = 0,
        offset = 0,
        last_time = 100,
        bandwidth = 0,
        url = '/api/v1/file/' + file_id;

    while(offset < size) {
        let blob: Blob = file.slice(offset, offset + 8 * 1024 * 1024);
        let buf: ArrayBuffer = await blob.arrayBuffer();
        let hash = hash_base64(buf);

        if(__DEV__) {
            console.info("Sending chunk %d of size %d with hash %s", chunk, blob.size, hash);
        }

        let res;

        try {
            res = await fetch({
                url,
                bearer,
                method: XHRMethod.PATCH,
                onprogress: (ev: ProgressEvent) => {
                    opts.onProgress(offset + ev.loaded, size);
                },
                headers: {
                    'Upload-Offset': offset.toString(),
                    'Upload-Checksum': "crc32 " + hash,
                    'Content-Type': 'application/offset+octet-stream',
                },
                body: blob,
                upload: true,
            });
        } catch(e) {
            __DEV__ && console.error("Error sending chunk: ", e);

            return;
        }

        __DEV__ && console.info("Completed chunk!");

        // TODO: Better error handling
        if(res.status != 204) {
            opts.onError(res);
            return;
        }

        offset += blob.size;
        chunk++;
    }

    return file_id;
}

function hash_base64(buf: ArrayBuffer): string {
    let bytes = new Uint8Array(4);
    new DataView(bytes.buffer).setInt32(0, crc32(new Uint8Array(buf)));
    return encodeBase64(bytes);
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