import { GetFilesystemStatus } from "client-sdk/src/api/commands/file";
import { CLIENT } from "state/global";
import { Snowflake } from "state/models";
import { DispatchableAction, Type } from "state/actions";

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
    }, file, opts.onProgress);
}

export function sendBlob(filename: string, blob: Blob): Promise<Snowflake | undefined> {
    return CLIENT.upload_stream({
        filename,
        mime: blob.type,
    }, blob);
}

export function fetch_quota(): DispatchableAction {
    return async (dispatch) => {
        let fs_status = await CLIENT.execute(GetFilesystemStatus({}));

        dispatch({
            type: Type.UPDATE_QUOTA,
            ...fs_status
        });
    };
}