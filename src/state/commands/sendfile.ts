import { encodeBase64, encodeUTF8toBase64 } from "lib/base64";
import { crc32_buf as crc32 } from "lib/crc32";
import { fetch, XHRMethod } from "lib/fetch";
import { Snowflake } from "state/models";
import { DispatchableAction, Type } from "state/root";

interface IFileUploadOpts {
    file: File,
    bearer: string,

    onProgress(loaded: number, total: number): void;
    onError(xhr: XMLHttpRequest): void;
}

interface IFileUploadState {
    offset: number,
    last_time: number,
    bandwidth: number,
}

export async function sendFile(opts: IFileUploadOpts): Promise<Snowflake | undefined> {
    let file = opts.file,
        size = file.size,
        name = file.name,
        mime = file.type;

    let meta_header = "filename " + encodeUTF8toBase64(name);
    if(mime) {
        meta_header += ",mime " + encodeUTF8toBase64(mime);
    }

    __DEV__ && console.info("POSTing new file ", name);

    let res = await fetch({
        url: '/api/v1/file',
        method: XHRMethod.POST,
        bearer: opts.bearer,
        headers: {
            'Upload-Metadata': meta_header,
            'Upload-Length': size.toString(),
        }
    });

    let file_id: Snowflake | null = res.getResponseHeader('Location');

    if(!file_id) return;

    __DEV__ && console.info("Sucess! Uploading file ", file_id);

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
                bearer: opts.bearer,
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