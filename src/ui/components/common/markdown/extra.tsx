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
        m: inlineRegex(/<([@#])(\d+)>/),
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

export function SolidMarkdownExtra(props: SolidMarkdownProps): SolidElement {
    let [local, div] = splitProps(props, ['source', 'inline', 'extra']);

    let res = createMemo(() => {
        let state = { inline: !!local.inline, extra: local.extra };
        return extraSolidOutput(extraRawParse(props.source, state), state);
    });

    return <div {...div} children={res()} />
}
