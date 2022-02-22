import React from "react";

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

export const MimeIcon = React.memo(({ category }: { category: MimeCategory }) => {
    let icon: string;
    switch(category) {
        case MimeCategory.Unknown: icon = UnknownFileIcon; break;
        case MimeCategory.PlainText: icon = PlainTextFileIcon; break;
        case MimeCategory.RichText: icon = RichTextFileIcon; break;
        case MimeCategory.Audio: icon = AudioFileIcon; break;
        case MimeCategory.Video: icon = VideoFileIcon; break;
        case MimeCategory.Image: icon = ImageFileIcon; break;
        case MimeCategory.Spreadsheet: icon = SpreadsheetFileIcon; break;
        case MimeCategory.Database: icon = DatabaseFileIcon; break;
        case MimeCategory.Program: icon = ProgramFileIcon; break;
        case MimeCategory.Terminal: icon = TerminalFileIcon; break;
        case MimeCategory.Script: icon = ScriptFileIcon; break;
        case MimeCategory.Presentation: icon = PresentationFileIcon; break;
        case MimeCategory.Code: icon = CodeFileIcon; break;
        case MimeCategory.Shield: icon = ShieldFileIcon; break;
        case MimeCategory.Key: icon = KeyFileIcon; break;
        case MimeCategory.Zip: icon = ZipFileIcon; break;
    }

    return (<VectorIcon src={icon} extra={{ 'data-category': MimeCategory[category].toLowerCase() }} />);
});

if(__DEV__) {
    MimeIcon.displayName = "MimeIcon";
}