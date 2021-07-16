import React, { useRef, useMemo, useEffect, useState } from "react";

import { GenericModal, GenericModalProps } from "../generic";

export interface FileUploadModalProps extends GenericModalProps {
    files: FileList
}

import "./file_upload.scss";
export const FileUploadModal = React.memo((props: FileUploadModalProps) => {
    let files: File[] = [];
    for(let idx = 0; idx < props.files.length; idx++) {
        files.push(props.files.item(idx)!);
    }

    return (
        <GenericModal {...props}>
            <div>
                {files.map((file) => {
                    return <MediaPreview key={file.name} file={file} />
                })}
            </div>
        </GenericModal>
    )
});

const MediaPreview = ({ file }: { file: File }) => {
    let ref = useRef<any>(null),
        [error, setError] = useState(false),
        t = file.type, media;

    useEffect(() => {
        if(!ref.current) return;

        let src = URL.createObjectURL(file);
        ref.current.src = src;
        return () => URL.revokeObjectURL(src);
    }, [ref.current, file]);

    while(!error && t.length) {
        let on_error = () => setError(true);

        if(t.startsWith('image/')) {
            media = <img ref={ref} onError={on_error} />;
        } else if(t.startsWith('video/')) {
            media = <video ref={ref} controls loop onError={on_error} />;
        } else if(t.startsWith('audio/')) {
            media = <audio ref={ref} controls onError={on_error} />;
        } else {
            break;
        }

        break;
    }

    if(!media) {
        media = <MimePreview file={file} />;
    }

    return (
        <div className="ln-upload-preview">
            <span>{file.name}</span>
            {media}
        </div>
    );
}

import PlainTextIcon from "icons/glyphicons-pro/glyphicons-filetypes-2-1/svg/individual-svg/glyphicons-filetypes-1-file-text.svg";
import RichTextIcon from "icons/glyphicons-pro/glyphicons-filetypes-2-1/svg/individual-svg/glyphicons-filetypes-2-file-rich-text.svg";
import ImageIcon from "icons/glyphicons-pro/glyphicons-filetypes-2-1/svg/individual-svg/glyphicons-filetypes-6-file-image.svg";
import UnknownIcon from "icons/glyphicons-pro/glyphicons-filetypes-2-1/svg/individual-svg/glyphicons-filetypes-38-file-question.svg";

import { getType } from 'mime';

import { Glyphicon } from "ui/components/common/glyphicon";

const MimePreview = ({ file }: { file: File }) => {
    let ext = file.name.replace(/.*?\.(\w+)$/, '$1').toLowerCase(),
        t = file.type || getType(file.name) || ext;

    let icon = UnknownIcon;
    if(t.startsWith('image')) {
        icon = ImageIcon;
    }

    return (
        <Glyphicon src={icon} />
    );
}