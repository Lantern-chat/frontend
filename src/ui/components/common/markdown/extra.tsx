import { DefaultRules, DefaultInRule, inlineRegex, defaultRules, outputFor, parserFor, SolidOutput, SolidElement, SolidMarkdownProps } from "./markdown";

export interface ExtraRules extends DefaultRules {
    readonly mention: DefaultInRule,
}

import { Mention } from "./components/mention";
import { createMemo, splitProps } from "solid-js";

export const extraRules: ExtraRules = {
    ...defaultRules,
    mention: {
        o: defaultRules.em.o,
        m: inlineRegex(/^<([@#])(\d+)>/),
        p: (capture, parse, state) => {
            return {
                prefix: capture[1],
                id: capture[2],
            };
        },
        h: (node, output, state) => <Mention prefix={node.prefix} id={node.id} />,
    },
};

const extraRawParse = parserFor(extraRules);
const extraSolidOutput: SolidOutput = outputFor(extraRules as any);

var ASTCache = window['AST_CACHE'] = new Map();

export function SolidMarkdownExtra(props: SolidMarkdownProps): SolidElement {
    let [local, div] = splitProps(props, ['source', 'inline', 'extra']);

    let res = () => {
        let state = { inline: !!local.inline, extra: local.extra };
        let ast = ASTCache.get(local.source);
        if(!ast) {
            ASTCache.set(local.source, ast = extraRawParse(props.source, state));
        }

        if(ASTCache.size > 500) ASTCache.clear();

        return extraSolidOutput(ast, state);
    };

    return <div {...div} children={res()} />
}
