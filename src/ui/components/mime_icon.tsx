import React from "react";

import PlainTextIcon from "icons/glyphicons-pro/glyphicons-filetypes-2-1/svg/individual-svg/glyphicons-filetypes-1-file-text.svg";
import RichTextIcon from "icons/glyphicons-pro/glyphicons-filetypes-2-1/svg/individual-svg/glyphicons-filetypes-2-file-rich-text.svg";
import MusicIcon from "icons/glyphicons-pro/glyphicons-filetypes-2-1/svg/individual-svg/glyphicons-filetypes-4-file-music.svg";
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

import { getType } from 'mime';

import { Glyphicon } from "ui/components/common/glyphicon";

const PREFIX_TYPEES = [
    ['image', ImageIcon],
    ['text/plain', PlainTextIcon],
    ['text', RichTextIcon],
    ['audio', MusicIcon],
    ['video', VideoIcon],
];

const EXT_TYPES = [
    {
        ext: ['sh', 'bat'],
        icon: TerminalIcon,
    },
    {
        ext: [/^html?5?$/i, 'xml', 'xhtml'],
        icon: ScriptIcon
    },
    {
        ext: ['pl', 'rs', 'py', /^[ch](pp)?$/i, /^[jt]sx?$/i],
        icon: CodeIcon,
    },
    {
        ext: ['mdd', /^md[bt]x?/i, /^accd[tb]/i, /sql/i, /^db[r23sa]?/i, 'wbd', 'sl3', 'odb', 'ibz'],
        icon: DatabaseIcon,
    },
    {
        ext: [/^xls[x]?/i, 'ods', 'xlr'],
        icon: SpreadsheetIcon,
    },
    {
        ext: [/^ppt[xma]?/i, 'keynote', 'odp', 'sdd', 'shw', 'ppv', 'sxi', 'ppg', 'sdp'],
        icon: PresentationIcon,
    },
    {
        ext: [/crypt/i, 'rem', 'lok', 'spd', 'ezk', 'shy', 'hpg', 'rae', /^r?aes/i, 'bfa'],
        icon: ShieldIcon,
    },
    {
        ext: ['gpg', 'pgp', 'rsa', 'skr', 'sec', 'spk', 'asc', 'key', 'sign', 'kdb', 'ska', 'prvkr', 'ppk', /^pk[rf]/i, /^pv[rk]/i, /^pkcs/i, /^aex/i, /^p7/i],
        icon: KeyIcon,
    },
    {
        ext: [
            /zip/i, /^[xr]ar/i, /^[g7xrbt]z/i, /s?7-?z(ip)?/i, /lz[4w]?/i,
            /^g?tar(\-(x|gz))?/i, /^t[gxb]z/i, 'pea', 'tg', /^pac?k/i, /^[gb]za/i,
            /lmza/i, /^(7?z)?\d+/i, 'compress', 'z'
        ],
        icon: ZipIcon,
    }
];

export const MimeIcon = React.memo(({ name, hint }: { name: string, hint?: string }) => {
    let ext = name.replace(/.*?\.(\w+)$/, '$1').toLowerCase(),
        t = hint || getType(name) || ext;

    let deduced_icon = UnknownIcon;

    for(let [prefix, icon] of PREFIX_TYPEES) {
        if(t.startsWith(prefix)) {
            deduced_icon = icon;
            break;
        }
    }

    if(ext && deduced_icon == UnknownIcon) {
        for(let test of EXT_TYPES) {
            for(let test_ext of test.ext) {
                if((typeof test_ext === 'string' && ext.startsWith(test_ext)) ||
                    (test_ext instanceof RegExp && test_ext.test(ext))) {
                    deduced_icon = test.icon;
                }
            }
        }
    }

    return (<Glyphicon src={deduced_icon} />);
});

if(__DEV__) {
    MimeIcon.displayName = "MimeIcon";
}