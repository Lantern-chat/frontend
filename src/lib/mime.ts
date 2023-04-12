export enum MimeCategory {
    Unknown,
    PlainText,
    RichText,
    Audio,
    Video,
    Image,
    Spreadsheet,
    Database,
    Program,
    Terminal,
    Script,
    Presentation,
    Code,
    Shield,
    Key,
    Zip,
}

const PREFIX_TYPES: Array<[string, MimeCategory]> = [
    ["image/svg", MimeCategory.Script],
    ["image", MimeCategory.Image],
    ["text/plain", MimeCategory.PlainText],
    ["text", MimeCategory.RichText],
    ["audio", MimeCategory.Audio],
    ["video", MimeCategory.Video],
];

const EXT_TYPES = [
    {
        e: ["sh", "bat"],
        c: MimeCategory.Terminal,
    },
    {
        e: [/^html?5?$/i, "xml", "xhtml", "svg"],
        c: MimeCategory.Script,
    },
    {
        e: ["pl", "rs", "py", /^[ch](pp)?$/i, /^[jt]sx?$/i],
        c: MimeCategory.Code,
    },
    {
        e: ["mdd", /^md[bt]x?/i, /^accd[tb]/i, /sql/i, /^db[r23sa]?/i, "wbd", "sl3", "odb", "ibz"],
        c: MimeCategory.Database,
    },
    {
        e: [/^xls[x]?/i, "ods", "xlr"],
        c: MimeCategory.Spreadsheet,
    },
    {
        e: [/^ppt[xma]?/i, "keynote", "odp", "sdd", "shw", "ppv", "sxi", "ppg", "sdp"],
        c: MimeCategory.Presentation,
    },
    {
        e: [/crypt/i, "rem", "lok", "spd", "ezk", "shy", "hpg", "rae", /^r?aes/i, "bfa"],
        c: MimeCategory.Shield,
    },
    {
        e: ["gpg", "pgp", "rsa", "skr", "sec", "spk", "asc", "key", "sign", "kdb", "ska", "prvkr", "ppk", /^pk[rf]/i, /^pv[rk]/i, /^pkcs/i, /^aex/i, /^p7/i],
        c: MimeCategory.Key,
    },
    {
        e: [
            /zip/i, /^[xr]ar/i, /^[g7xrbt]z/i, /s?7-?z(ip)?/i, /lz[4w]?/i,
            /^g?tar(\-(x|gz))?/i, /^t[gxb]z/i, "pea", "tg", /^pac?k/i, /^[gb]za/i,
            /lmza/i, /^(7?z)?\d+/i, "compress", "z"
        ],
        c: MimeCategory.Zip,
    }
];

import { getType } from "mime";

export function categorize_mime(filename: string, hint?: string): MimeCategory {
    let ext = filename.replace(/.*?\.(\w+)$/, "$1").toLowerCase(),
        t = hint || getType(filename) || ext;

    let deduced = MimeCategory.Unknown;

    for(let [prefix, cat] of PREFIX_TYPES) {
        if(t.startsWith(prefix)) {
            deduced = cat;
            break;
        }
    }

    if(ext && deduced == MimeCategory.Unknown) {
        for(let test of EXT_TYPES) {
            for(let test_ext of test.e) {
                if((typeof test_ext === "string" && ext.startsWith(test_ext)) ||
                    (test_ext instanceof RegExp && test_ext.test(ext))) {
                    deduced = test.c;
                }
            }
        }
    }

    return deduced;
}