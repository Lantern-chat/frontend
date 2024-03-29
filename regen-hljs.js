const fs = require('fs');

const PATH = './src/ui/components/common/markdown/components/code.tsx';

let code = fs.readFileSync(PATH).toString();

let hljs = require('highlight.js/lib/core');

let all_aliases = [];

let language_files = fs.readdirSync('./node_modules/highlight.js/lib/languages').filter(p => !p.endsWith('.js.js')).map(p => {
    let lang = require('highlight.js/lib/languages/' + p.slice(0, -3));

    // intercept aliases for this language as it's registered
    let aliases = [];
    hljs.registerLanguage(p.slice(0, -3), (h) => {
        let l = lang(h);
        if(l.aliases) {
            // deduplicate aliases...
            aliases = l.aliases.filter(a => !all_aliases.includes(a));
            all_aliases = all_aliases.concat(aliases);
        }
        return l;
    });

    return { p, aliases };
});

code = code.replace(
    /\/\/ == AUTOGENERATED BELOW THIS LINE ==[^]*/,
    `// == AUTOGENERATED BELOW THIS LINE ==
const LANGUAGES: { [language: string]: string | LanguageLoader } = {
${language_files.map(l => `    "${l.p.slice(0, -3)}": () => import("highlight.js/lib/languages/${l.p.slice(0, -3)}"),`).join("\n")}
${language_files.filter(l => l.aliases?.length == 1).map(l => `    "${l.aliases[0]}": "${l.p.slice(0, -3)}",`).join("\n")}
}
${language_files.filter(l => l.aliases?.length > 1).map(l => `${l.aliases.map(a => `LANGUAGES["${a}"]`).join(" = ")} = "${l.p.slice(0, -3)}";`).join("\n")}
`);

fs.writeFileSync(PATH, code);