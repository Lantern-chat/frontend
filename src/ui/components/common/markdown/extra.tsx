import { DefaultRules, DefaultInRule, inlineRegex, defaultRules, outputFor, parserFor, SolidOutput, SolidElement, SolidMarkdownProps, State, clean_text, has_text, SingleASTNode } from "./markdown";

export interface ExtraRules extends DefaultRules {
    readonly mention: DefaultInRule,
}

import { Mention } from "./components/mention";
import { splitProps } from "solid-js";

export const extraRules: ExtraRules = {
    ...defaultRules,
    mention: {
        o: defaultRules.custom_emote.o + 0.1,
        m: inlineRegex(/^<([@#])(\d+)>/),
        p: (capture, parse, state) => {
            return {
                prefix: capture[1],
                id: capture[2],
            };
        },
        h: (node, output, state) => <Mention prefix={/* @once */node.prefix} id={/* @once */node.id} />,
    },
};

const extraRawParse = parserFor(extraRules);
const extraSolidOutput: SolidOutput = outputFor(extraRules as any);

export function SolidMarkdownExtra(props: SolidMarkdownProps): SolidElement {
    let [local, div] = splitProps(props, ["source", "inline", "extra"]);

    let res = () => {
        let state: State = { inline: !!local.inline, extra: local.extra };

        let ast = extraRawParse(props.source, state);

        if(state.had_emoji && (state.no_text = !has_text(ast))) {
            ast = clean_text(ast);
        }

        return extraSolidOutput(ast, state);
    };

    return <div {...div} children={res()} />
}
