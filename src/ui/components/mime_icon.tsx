import React from "react";

import { MimeCategory } from "lib/mime";

import PlainTextIcon from "icons/glyphicons-pro/glyphicons-filetypes-2-1/svg/individual-svg/glyphicons-filetypes-1-file-text.svg";
import RichTextIcon from "icons/glyphicons-pro/glyphicons-filetypes-2-1/svg/individual-svg/glyphicons-filetypes-2-file-rich-text.svg";
import AudioIcon from "icons/glyphicons-pro/glyphicons-filetypes-2-1/svg/individual-svg/glyphicons-filetypes-4-file-music.svg";
import VideoIcon from "icons/glyphicons-pro/glyphicons-filetypes-2-1/svg/individual-svg/glyphicons-filetypes-5-file-video.svg";
import ImageIcon from "icons/glyphicons-pro/glyphicons-filetypes-2-1/svg/individual-svg/glyphicons-filetypes-6-file-image.svg";
import SpreadsheetIcon from "icons/glyphicons-pro/glyphicons-filetypes-2-1/svg/individual-svg/glyphicons-filetypes-9-file-spreadsheet.svg";
import DatabaseIcon from "icons/glyphicons-pro/glyphicons-filetypes-2-1/svg/individual-svg/glyphicons-filetypes-10-file-database.svg";
import ProgramIcon from "icons/glyphicons-pro/glyphicons-filetypes-2-1/svg/individual-svg/glyphicons-filetypes-11-file-program.svg";
import TerminalIcon from "icons/glyphicons-pro/glyphicons-filetypes-2-1/svg/individual-svg/glyphicons-filetypes-12-file-terminal.svg";
import ScriptIcon from "icons/glyphicons-pro/glyphicons-filetypes-2-1/svg/individual-svg/glyphicons-filetypes-15-file-script.svg";
import PresentationIcon from "icons/glyphicons-pro/glyphicons-filetypes-2-1/svg/individual-svg/glyphicons-filetypes-16-file-presentation.svg";
import UnknownIcon from "icons/glyphicons-pro/glyphicons-filetypes-2-1/svg/individual-svg/glyphicons-filetypes-38-file-question.svg";
import CodeIcon from "icons/glyphicons-pro/glyphicons-filetypes-2-1/svg/individual-svg/glyphicons-filetypes-82-file-css.svg";
import ShieldIcon from "icons/glyphicons-pro/glyphicons-filetypes-2-1/svg/individual-svg/glyphicons-filetypes-84-file-shield.svg";
import KeyIcon from "icons/glyphicons-pro/glyphicons-filetypes-2-1/svg/individual-svg/glyphicons-filetypes-85-file-key.svg";
import ZipIcon from "icons/glyphicons-pro/glyphicons-filetypes-2-1/svg/individual-svg/glyphicons-filetypes-24-file-zip.svg";

import { Glyphicon } from "ui/components/common/glyphicon";

export const MimeIcon = React.memo(({ category }: { category: MimeCategory }) => {
    let icon: string;
    switch(category) {
        case MimeCategory.Unknown: icon = UnknownIcon; break;
        case MimeCategory.PlainText: icon = PlainTextIcon; break;
        case MimeCategory.RichText: icon = RichTextIcon; break;
        case MimeCategory.Audio: icon = AudioIcon; break;
        case MimeCategory.Video: icon = VideoIcon; break;
        case MimeCategory.Image: icon = ImageIcon; break;
        case MimeCategory.Spreadsheet: icon = SpreadsheetIcon; break;
        case MimeCategory.Database: icon = DatabaseIcon; break;
        case MimeCategory.Program: icon = ProgramIcon; break;
        case MimeCategory.Terminal: icon = TerminalIcon; break;
        case MimeCategory.Script: icon = ScriptIcon; break;
        case MimeCategory.Presentation: icon = PresentationIcon; break;
        case MimeCategory.Code: icon = CodeIcon; break;
        case MimeCategory.Shield: icon = ShieldIcon; break;
        case MimeCategory.Key: icon = KeyIcon; break;
        case MimeCategory.Zip: icon = ZipIcon; break;
    }

    return (<Glyphicon src={icon} extra={{ 'data-category': MimeCategory[category].toLowerCase() }} />);
});

if(__DEV__) {
    MimeIcon.displayName = "MimeIcon";
}