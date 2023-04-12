import { MimeCategory } from "lib/mime";

import { Icons } from "lantern-icons";
import { VectorIcon } from "ui/components/common/icon";

export function MimeIcon(props: { category: MimeCategory }) {
    let icon = () => {
        switch(props.category) {
            case MimeCategory.PlainText: return Icons.PlainTextFile;
            case MimeCategory.RichText: return Icons.RichTextFile;
            case MimeCategory.Audio: return Icons.AudioFile;
            case MimeCategory.Video: return Icons.VideoFile;
            case MimeCategory.Image: return Icons.ImageFile;
            case MimeCategory.Spreadsheet: return Icons.SpreadsheetFile;
            case MimeCategory.Database: return Icons.DatabaseFile;
            case MimeCategory.Program: return Icons.ProgramFile;
            case MimeCategory.Terminal: return Icons.TerminalFile;
            case MimeCategory.Script: return Icons.ScriptFile;
            case MimeCategory.Presentation: return Icons.PresentationFile;
            case MimeCategory.Code: return Icons.CodeFile;
            case MimeCategory.Shield: return Icons.EncryptedFile;
            case MimeCategory.Key: return Icons.KeyFile;
            case MimeCategory.Zip: return Icons.ZipFile;
            default: return Icons.UnknownFile;
        }
    };

    return (<VectorIcon id={icon()} extra={{ "data-category": MimeCategory[props.category].toLowerCase() }} />);
}
