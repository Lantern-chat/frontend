import React, { useRef, useMemo, useEffect, useState, forwardRef, createRef } from "react";

import { MimeIcon } from "ui/components/mime_icon";

import { GenericModal, GenericModalProps } from "../generic";

export interface FileUploadModalProps extends GenericModalProps {
    files: FileList
}

interface FileUploadModalState {
    files: File[],
    media_refs: React.MutableRefObject<any>[];
}

import "./file_upload.scss";
export class FileUploadModal extends React.Component<FileUploadModalProps, FileUploadModalState> {
    constructor(props: FileUploadModalProps) {
        super(props);

        this.state = {
            files: [],
            media_refs: []
        }

        for(let idx = 0; idx < this.props.files.length; idx++) {
            this.state.files.push(this.props.files.item(idx)!);
            this.state.media_refs.push(createRef());
        }
    }

    componentDidMount() {
        __DEV__ && console.log(this.state.media_refs.map(r => r.current));
    }

    render() {
        let { files, media_refs } = this.state;

        let multiclass = ' ln-multi-upload-';
        switch(files.length) {
            case 1: multiclass = ''; break;
            case 2: multiclass += '2'; break;
            case 3: multiclass += '3'; break;
            default: multiclass += '4'; break;
        }

        return (
            <GenericModal {...this.props}>
                <div className={"ln-upload-previews" + multiclass}>
                    {files.map((file, i) => {
                        return <MediaPreview key={file.name} file={file} ref={media_refs[i]} />
                    })}
                </div>
            </GenericModal>
        )
    }
}


const MediaPreview = forwardRef(({ file }: { file: File }, ref: React.MutableRefObject<any>) => {
    let [error, setError] = useState(false),
        t = file.type,
        media;

    useEffect(() => {
        if(!ref.current) return;

        let src = URL.createObjectURL(file);
        ref.current.src = src;
        return () => URL.revokeObjectURL(src);
    }, [ref.current, file]);

    while(!error && t.length) {
        let on_error = () => setError(true), className = 'ln-media';

        if(t.startsWith('image/')) {
            media = <img className={className} ref={ref} onError={on_error} />;
        } else if(t.startsWith('video/')) {
            media = <video className={className} ref={ref} controls loop onError={on_error} />;
        } else if(t.startsWith('audio/')) {
            media = <audio className={className} ref={ref} controls onError={on_error} />;
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
            <span>{file.name}</span>
            {media}
        </div>
    );
});
