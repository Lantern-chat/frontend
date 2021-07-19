import React, { useRef, useMemo, useEffect, useState, forwardRef, createRef } from "react";

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
        console.log(this.state.media_refs.map(r => r.current));
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
        t = file.type, media;

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
        media = <MimePreview file={file} />;
    }

    return (
        <div className="ln-upload-preview">
            <span>{file.name}</span>
            {media}
        </div>
    );
});

import PlainTextIcon from "icons/glyphicons-pro/glyphicons-filetypes-2-1/svg/individual-svg/glyphicons-filetypes-1-file-text.svg";
import RichTextIcon from "icons/glyphicons-pro/glyphicons-filetypes-2-1/svg/individual-svg/glyphicons-filetypes-2-file-rich-text.svg";
import MusicIcon from "icons/glyphicons-pro/glyphicons-filetypes-2-1/svg/individual-svg/glyphicons-filetypes-4-file-music.svg";
import ImageIcon from "icons/glyphicons-pro/glyphicons-filetypes-2-1/svg/individual-svg/glyphicons-filetypes-6-file-image.svg";
import ScriptIcon from "icons/glyphicons-pro/glyphicons-filetypes-2-1/svg/individual-svg/glyphicons-filetypes-15-file-script.svg";
import TerminalIcon from "icons/glyphicons-pro/glyphicons-filetypes-2-1/svg/individual-svg/glyphicons-filetypes-12-file-terminal.svg";
import UnknownIcon from "icons/glyphicons-pro/glyphicons-filetypes-2-1/svg/individual-svg/glyphicons-filetypes-38-file-question.svg";

import { getType } from 'mime';

import { Glyphicon } from "ui/components/common/glyphicon";

const PREFIX_TYPEES = [
    ['image', ImageIcon],
    ['text/plain', PlainTextIcon],
    ['text', RichTextIcon],
    ['audio', MusicIcon],
];

const EXT_TYPES = [
    {
        ext: ['sh', 'bat'],
        icon: TerminalIcon,
    },
    {
        ext: ['perl', 'rs'],
        icon: ScriptIcon,
    }
];

const MimePreview = ({ file }: { file: File }) => {
    let ext = file.name.replace(/.*?\.(\w+)$/, '$1').toLowerCase(),
        t = file.type || getType(file.name) || ext;

    let deduced_icon = UnknownIcon;

    for(let [prefix, icon] of PREFIX_TYPEES) {
        if(t.startsWith(prefix)) {
            deduced_icon = icon;
            break;
        }
    }

    if(ext && deduced_icon == UnknownIcon) {
        for(let test of EXT_TYPES) {
            if(test.ext.indexOf(ext) > 0) {
                deduced_icon = test.icon;
                break;
            }
        }
    }

    return (
        <Glyphicon src={deduced_icon} />
    );
}