import React, { useRef, useMemo, useEffect, useState, forwardRef, createRef, useCallback } from "react";
import { useDispatch } from "react-redux";
import { sendMessage } from "state/commands";
import { sendFile } from "state/commands/sendfile";
import { Snowflake } from "state/models";
import { DispatchableAction } from "state/root";
import { FormGroup } from "ui/components/form";

import { MimeIcon } from "ui/components/mime_icon";
import { MsgTextarea } from "../../components/channel/message/textarea";

import { GenericModal, GenericModalProps } from "../generic";

export interface FileUploadModalProps extends GenericModalProps {
    files: FileList,
    bearer: string,
    room_id: Snowflake,
    onClose: () => void,
}

import "./file_upload.scss";
export const FileUploadModal = React.memo((props: FileUploadModalProps) => {
    let files = useMemo(() => {
        let files = [];
        for(let idx = 0; idx < props.files.length; idx++) {
            files.push(props.files.item(idx)!);
        }

        return files;
    }, [props.files]);

    let multiclass = ' ln-multi-upload-';
    switch(files.length) {
        case 1: multiclass = ''; break;
        case 2: multiclass += '2'; break;
        case 3: multiclass += '3'; break;
        default: multiclass += '4'; break;
    }

    let [uploading, setUploading] = useState(false);

    let onClose = useCallback(() => {
        if(!uploading) {
            props.onClose();
        }
    }, [props.onClose, uploading]);

    let dispatch = useDispatch();

    let onUpload = useCallback(() => {
        if(uploading) return;

        setUploading(true);

        dispatch((async (dispatch, getState) => {
            let bearer = getState().user.session!.auth;

            let onError = () => console.error("Upload error");
            let onProgress = () => { };

            let uploads = files.map(file => sendFile(bearer, { file: { file }, onError, onProgress }));

            let ids = await Promise.all(uploads);

            console.log("Files uploaded:", ids);

            dispatch(sendMessage(props.room_id, "", ids.filter(id => typeof id == 'string') as string[]));

            setUploading(false);

            props.onClose();

        }) as DispatchableAction);

    }, [props, files, uploading]);

    let noop = () => { };

    return (
        <GenericModal {...props} onClose={onClose}>
            <div className="ln-upload">
                <div className={"ln-upload-previews" + multiclass}>
                    {files.map((file, i) => {
                        return <MediaPreview key={file.name} file={file} />
                    })}
                </div>

                <MsgTextarea value="" onChange={noop} onBlur={noop} onFocus={noop} onKeyDown={noop} onContextMenu={noop} mobile={false} />

                <FormGroup id="upload-button">
                    <button className="ln-btn ui-text" onClick={onUpload}>
                        Upload
                    </button>
                </FormGroup>
            </div>
        </GenericModal>
    )
});

const MediaPreview = ({ file }: { file: File }) => {
    let [error, setError] = useState(false),
        t = file.type,
        media, ref = useRef<HTMLImageElement | HTMLVideoElement | HTMLAudioElement>(null);

    useEffect(() => {
        if(!ref.current) return;

        let src = URL.createObjectURL(file);
        ref.current.src = src;
        return () => URL.revokeObjectURL(src);
    }, [ref.current, file]);

    while(!error && t.length) {
        let on_error = () => setError(true), className = 'ln-media';

        if(t.startsWith('image/')) {
            media = <img className={className} ref={ref as any} onError={on_error} />;
        } else if(t.startsWith('video/')) {
            media = <video className={className} ref={ref as any} controls loop onError={on_error} />;
        } else if(t.startsWith('audio/')) {
            media = <audio className={className} ref={ref as any} controls onError={on_error} />;
        } else {
            break;
        }

        break;
    }

    if(!media) {
        media = <MimeIcon name={file.name} hint={file.type} />;
    }

    return (
        <div className="ln-upload-preview">
            <span className="ui-text">{file.name}</span>
            {media}
        </div>
    );
};
