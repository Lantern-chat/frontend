import { createMemo } from "solid-js";

import { MimeCategory } from "lib/mime";

import {
    PlainTextFileIcon,
    RichTextFileIcon,
    AudioFileIcon,
    VideoFileIcon,
    ImageFileIcon,
    SpreadsheetFileIcon,
    DatabaseFileIcon,
    ProgramFileIcon,
    TerminalFileIcon,
    ScriptFileIcon,
    PresentationFileIcon,
    UnknownFileIcon,
    CodeFileIcon,
    ShieldFileIcon,
    KeyFileIcon,
    ZipFileIcon,
} from "lantern-icons";

import { VectorIcon } from "ui/components/common/icon";

export function MimeIcon(props: { category: MimeCategory }) {
    let icon = createMemo(() => {
        switch(props.category) {
            case MimeCategory.PlainText: return PlainTextFileIcon;
            case MimeCategory.RichText: return RichTextFileIcon;
            case MimeCategory.Audio: return AudioFileIcon;
            case MimeCategory.Video: return VideoFileIcon;
            case MimeCategory.Image: return ImageFileIcon;
            case MimeCategory.Spreadsheet: return SpreadsheetFileIcon;
            case MimeCategory.Database: return DatabaseFileIcon;
            case MimeCategory.Program: return ProgramFileIcon;
            case MimeCategory.Terminal: return TerminalFileIcon;
            case MimeCategory.Script: return ScriptFileIcon;
            case MimeCategory.Presentation: return PresentationFileIcon;
            case MimeCategory.Code: return CodeFileIcon;
            case MimeCategory.Shield: return ShieldFileIcon;
            case MimeCategory.Key: return KeyFileIcon;
            case MimeCategory.Zip: return ZipFileIcon;
            default: return UnknownFileIcon;
        }
    });

    return (<VectorIcon src={icon()} extra={{ 'data-category': MimeCategory[props.category].toLowerCase() }} />);
}
