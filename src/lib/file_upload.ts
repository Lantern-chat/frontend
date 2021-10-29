interface IFileUploadOptions {
    maxChunkSize: number,
    onProgress: (progress: number) => void,
    onFinish: () => void,
}

const DEFAULT_FILE_UPLOAD_OPTIONS: IFileUploadOptions = {
    maxChunkSize: 1024 * 1024 * 8, // 8MiB
    onProgress: (_) => { },
    onFinish: () => { },
};

export function upload_file(file: File, options: Partial<IFileUploadOptions>) {
    options = { ...DEFAULT_FILE_UPLOAD_OPTIONS, ...options };
}