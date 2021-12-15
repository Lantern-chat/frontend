import { DefaultRules, DefaultInRule, DefaultInOutRule, inlineRegex, defaultRules, outputFor, parserFor, ReactOutput, ReactElement, ReactMarkdownProps, reactElement } from "./markdown";

export interface ExtraRules extends DefaultRules {
    readonly mention: DefaultInRule,
}

import { Mention } from "./components/mention";

export const extraRules: ExtraRules = {
    ...defaultRules,
    mention: {
        order: defaultRules.em.order,
        match: inlineRegex(/<([@#])(\d+)>/),
        parse: function(capture, parse, state) {
            return {
                prefix: capture[1],
                id: capture[2],
            };
        },
        react: function(node, output, state) {
            return <Mention prefix={node.prefix} id={node.id} key={state.key} />;
        },
    },
};

export const extraRawParse = parserFor(extraRules);
export const extraReactOutput: ReactOutput = outputFor(extraRules as any);

export function ReactMarkdownExtra(props: ReactMarkdownProps): ReactElement {
    var divProps: any = {};

    for(var prop in props) {
        if(prop !== 'source' && Object.prototype.hasOwnProperty.call(props, prop)) {
            divProps[prop] = props[prop];
        }
    }

    let state = { inline: !!props.inline };
    divProps.children = extraReactOutput(extraRawParse(props.source, state), state);

    return reactElement(
        'div',
        null,
        divProps
    );
};

if(__DEV__) {
    ReactMarkdownExtra.displayName = "ReactMarkdownExtra";
}