import React, { useState } from "react";

import { Spoiler } from "./components/spoiler";
//import { Code, Math } from "./lazy";

import Code from "./components/code";
import Math from "./components/math";

export interface Capture extends Array<string> {
    index?: number,
    input?: string,
}
type Attr = string | number | boolean | null | undefined;
export type TableAlignment = "right" | "center" | "left" | null;


export interface SingleASTNode {
    type: string,
    [prop: string]: any,
}

export interface UnTypedASTNode {
    [prop: string]: any
}

export type ASTNode = SingleASTNode | Array<SingleASTNode>;

export interface State {
    key?: string | number | undefined;
    inline?: boolean | undefined;
    pos?: number,
    [prop: string]: any,
}
export type OptionalState = State | null | undefined;

export type ReactElement = React.ReactElement<any>;
export type ReactElements = React.ReactNode;

export interface MatchFunction {
    (source: string, state: State, prevCapture: string): Capture | null,
    regex?: RegExp,
}

export type Parser = (
    source: string,
    state?: OptionalState,
) => Array<SingleASTNode>;

export type ParseFunction = (
    capture: Capture,
    nestedParse: Parser,
    state: State,
) => (UnTypedASTNode | ASTNode);

export type SingleNodeParseFunction = (
    capture: Capture,
    nestedParse: Parser,
    state: State,
) => UnTypedASTNode;

export type Output<Result> = (
    node: ASTNode,
    state?: OptionalState
) => Result;

export type RefiningNodeOutput<Input, Result extends Input> = (
    node: SingleASTNode,
    nestedOutput: Output<Input>,
    state: State
) => Result;

export type NodeOutput<Result> = RefiningNodeOutput<Result, Result>;

export type ArrayNodeOutput<Result> = (
    node: Array<SingleASTNode>,
    nestedOutput: Output<Result>,
    state: State
) => Result;

export type ReactOutput = Output<ReactElements>;
export type ReactNodeOutput = NodeOutput<ReactElements>;
export type HtmlOutput = Output<string>;
export type HtmlNodeOutput = NodeOutput<string>;

export interface ParserRule {
    readonly order: number,
    readonly match: MatchFunction,
    readonly quality?: (capture: Capture, state: State, prevCapture: string) => number,
    readonly parse: ParseFunction,
}

export interface SingleNodeParserRule extends ParserRule {
    readonly order: number,
    readonly match: MatchFunction,
    readonly quality?: (capture: Capture, state: State, prevCapture: string) => number,
    readonly parse: SingleNodeParseFunction,
}

export interface ReactOutputRule {
    // we allow null because some rules are never output results, and that's
    // legal as long as no parsers return an AST node matching that rule.
    // We don't use ? because this makes it be explicitly defined as either
    // a valid function or null, so it can't be forgotten.
    readonly react: ReactNodeOutput | null,
}

export interface ArrayRule {
    readonly react?: ArrayNodeOutput<ReactElements>,
    readonly [other: string]: ArrayNodeOutput<any> | undefined,
}
export interface ReactArrayRule extends ArrayRule {
    readonly react: ArrayNodeOutput<ReactElements>,
    readonly [other: string]: ArrayNodeOutput<any> | undefined,
}
export interface DefaultArrayRule extends ArrayRule {
    readonly react: ArrayNodeOutput<ReactElements>,
}

export interface ParserRules {
    readonly Array?: ArrayRule,
    readonly [type: string]: ParserRule | /* only for Array: */ ArrayRule | undefined,
}

export interface OutputRules<Rule> {
    readonly Array?: ArrayRule,
    readonly [type: string]: Rule | /* only for Array: */ ArrayRule | undefined,
}
export interface Rules<OutputRule> {
    readonly Array?: ArrayRule,
    readonly [type: string]: ParserRule & OutputRule | /* only for Array: */ ArrayRule | undefined,
}
export interface ReactRules {
    readonly Array?: ReactArrayRule,
    readonly [type: string]: ParserRule & ReactOutputRule | ReactArrayRule | undefined,
}

// We want to clarify our defaultRules types a little bit more so clients can
// reuse defaultRules built-ins. So we make some stronger guarantess when
// we can:
export interface NonNullReactOutputRule extends ReactOutputRule {
    readonly react: ReactNodeOutput,
}
export interface ElementReactOutputRule extends ReactOutputRule {
    readonly react: RefiningNodeOutput<ReactElements, ReactElement>,
}
export interface TextReactOutputRule extends ReactOutputRule {
    readonly react: RefiningNodeOutput<ReactElements, string>,
}

export interface ReactMarkdownProps {
    source: string,
    inline?: boolean,
    [prop: string]: any,
}

export type DefaultInRule = SingleNodeParserRule & ReactOutputRule;
export type TextInOutRule = SingleNodeParserRule & TextReactOutputRule;
export type LenientInOutRule = SingleNodeParserRule & NonNullReactOutputRule;
export type DefaultInOutRule = SingleNodeParserRule & ElementReactOutputRule;

type DefaultRulesIndexer = ReactRules;
export interface DefaultRules extends DefaultRulesIndexer {
    readonly Array: DefaultArrayRule,
    readonly heading: DefaultInOutRule,
    readonly nptable: DefaultInRule,
    readonly lheading: DefaultInRule,
    readonly hr: DefaultInOutRule,
    readonly codeBlock: DefaultInOutRule,
    readonly blockMath: DefaultInOutRule,
    //readonly fence: DefaultInRule,
    readonly blockQuote: DefaultInOutRule,
    //readonly list: DefaultInOutRule,
    //readonly def: LenientInOutRule,
    readonly table: DefaultInOutRule,
    readonly tableSeparator: DefaultInRule,
    readonly newline: TextInOutRule,
    readonly paragraph: DefaultInOutRule,
    readonly escape: DefaultInRule,
    readonly autolink: DefaultInRule,
    readonly mailto: DefaultInRule,
    readonly url: DefaultInRule,
    readonly math: DefaultInOutRule,
    readonly unescapedDollar: DefaultInOutRule,
    readonly link: DefaultInOutRule,
    readonly image: DefaultInOutRule,
    //readonly reflink: DefaultInRule,
    //readonly refimage: DefaultInRule,
    readonly em: DefaultInOutRule,
    readonly strong: DefaultInOutRule,
    readonly u: DefaultInOutRule,
    readonly spoiler: DefaultInOutRule,
    readonly del: DefaultInOutRule,
    readonly tags: DefaultInOutRule,
    readonly inlineCode: DefaultInOutRule,
    readonly br: DefaultInOutRule,
    readonly text: TextInOutRule,
}

export interface RefNode {
    type: string,
    content?: ASTNode,
    target?: string,
    title?: string,
    alt?: string,
}


//
// EXPORTED FUNCTIONS
//

type OutputFor = <Rule extends Object, Type extends keyof Rule>(
    rules: OutputRules<Rule>,
    property: Type,
    defaultState?: OptionalState
) => Output<any>;


var CR_NEWLINE_R = /\r\n?/g;
var TAB_R = /\t/g;
var FORMFEED_R = /\f/g;

/**
 * Turn various whitespace into easy-to-process whitespace
 */
export function preprocess(source: string): string {
    return source.replace(CR_NEWLINE_R, '\n')
        .replace(FORMFEED_R, '')
        .replace(TAB_R, '    ');
}

function populateInitialState(
    givenState?: State,
    defaultState?: State,
): State {
    var state: State = givenState || {};
    if(defaultState != null) {
        for(var prop in defaultState) {
            if(Object.prototype.hasOwnProperty.call(defaultState, prop)) {
                state[prop] = defaultState[prop];
            }
        }
    }
    return state;
};

/**
 * Creates a parser for a given set of rules, with the precedence
 * specified as a list of rules.
 *
 * @param {SimpleMarkdown.ParserRules} rules
 *     an object containing
 *     rule type -> {match, order, parse} objects
 *     (lower order is higher precedence)
 * @param {SimpleMarkdown.OptionalState} [defaultState]
 *
 * @returns {SimpleMarkdown.Parser}
 *     The resulting parse function, with the following parameters:
 *     @source: the input source string to be parsed
 *     @state: an optional object to be threaded through parse
 *         calls. Allows clients to add stateful operations to
 *         parsing, such as keeping track of how many levels deep
 *         some nesting is. For an example use-case, see passage-ref
 *         parsing in src/widgets/passage/passage-markdown.jsx
 */
export function parserFor(rules: ParserRules, defaultState?: State): Parser {
    // Sorts rules in order of increasing order, then
    // ascending rule name in case of ties.
    var ruleList = Object.keys(rules).filter(function(type) {
        var rule = rules[type];
        if(rule == null || rule.match == null) {
            return false;
        }
        var order = rule.order;
        if((typeof order !== 'number' || !isFinite(order)) &&
            typeof console !== 'undefined') {
            console.warn(
                "simple-markdown: Invalid order for rule `" + type + "`: " +
                String(order)
            );
        }
        return true;
    });

    ruleList.sort(function(typeA, typeB) {
        var ruleA: ParserRule = rules[typeA] as any;
        var ruleB: ParserRule = rules[typeB] as any;
        var orderA = ruleA.order;
        var orderB = ruleB.order;

        // First sort based on increasing order
        if(orderA !== orderB) {
            return orderA - orderB;
        }

        var secondaryOrderA = ruleA.quality ? 0 : 1;
        var secondaryOrderB = ruleB.quality ? 0 : 1;

        if(secondaryOrderA !== secondaryOrderB) {
            return secondaryOrderA - secondaryOrderB;

            // Then based on increasing unicode lexicographic ordering
        } else if(typeA < typeB) {
            return -1;
        } else if(typeA > typeB) {
            return 1;

        } else {
            // Rules should never have the same name,
            // but this is provided for completeness.
            return 0;
        }
    });

    var latestState: State;
    var nestedParse: Parser = function(source: string, state?: State): SingleASTNode[] {
        var result: SingleASTNode[] = [];
        state = state || latestState;
        latestState = state;
        while(source) {
            // store the best match, it's rule, and quality:
            var ruleType = null;
            var rule = null;
            var capture = null;
            var quality = NaN;

            // loop control variables:
            var i = 0;
            var currRuleType = ruleList[0];
            var currRule: ParserRule = rules[currRuleType] as any;

            do {
                var currOrder = currRule.order;
                var prevCaptureStr = state.prevCapture == null ? "" : state.prevCapture[0];
                var currCapture = currRule.match(source, state, prevCaptureStr);

                if(currCapture) {
                    var currQuality = currRule.quality ? currRule.quality(
                        currCapture,
                        state,
                        prevCaptureStr
                    ) : 0;
                    // This should always be true the first time because
                    // the initial quality is NaN (that's why there's the
                    // condition negation).
                    if(!(currQuality <= quality)) {
                        ruleType = currRuleType;
                        rule = currRule;
                        capture = currCapture;
                        quality = currQuality;
                    }
                }

                // Move on to the next item.
                // Note that this makes `currRule` be the next item
                i++;
                currRuleType = ruleList[i];
                currRule = rules[currRuleType] as any;

            } while(
                // keep looping while we're still within the ruleList
                currRule && (
                    // if we don't have a match yet, continue
                    !capture || (
                        // or if we have a match, but the next rule is
                        // at the same order, and has a quality measurement
                        // functions, then this rule must have a quality
                        // measurement function (since they are sorted before
                        // those without), and we need to check if there is
                        // a better quality match
                        currRule.order === currOrder &&
                        currRule.quality
                    )
                )
            );

            // TODO(aria): Write tests for these
            if(rule == null || capture == null /*:: || ruleType == null */) {
                throw new Error(
                    "Could not find a matching rule for the below " +
                    "content. The rule with highest `order` should " +
                    "always match content provided to it. Check " +
                    "the definition of `match` for '" +
                    ruleList[ruleList.length - 1] +
                    "'. It seems to not match the following source:\n" +
                    source
                );
            }
            if(capture.index) { // If present and non-zero, i.e. a non-^ regexp result:
                throw new Error(
                    "`match` must return a capture starting at index 0 " +
                    "(the current parse index). Did you forget a ^ at the " +
                    "start of the RegExp?"
                );
            }

            var parsed = rule.parse(capture, nestedParse, state);
            // We maintain the same object here so that rules can
            // store references to the objects they return and
            // modify them later. (oops sorry! but this adds a lot
            // of power--see reflinks.)
            if(Array.isArray(parsed)) {
                Array.prototype.push.apply(result, parsed);
            } else {
                // We also let rules override the default type of
                // their parsed node if they would like to, so that
                // there can be a single output function for all links,
                // even if there are several rules to parse them.
                if(parsed.type == null) {
                    parsed.type = ruleType;
                }
                result.push(parsed as SingleASTNode);
            }

            state.prevCapture = capture;
            state.pos! += capture[0].length;
            source = source.substring(state.prevCapture[0].length);
        }
        return result;
    };

    var outerParse: Parser = function(source: string, state?: State) {
        latestState = populateInitialState(state, defaultState);
        if(!latestState.inline && !latestState.disableAutoBlockNewlines) {
            source = source + "\n\n";
        }
        // We store the previous capture so that match functions can
        // use some limited amount of lookbehind. Lists use this to
        // ensure they don't match arbitrary '- ' or '* ' in inline
        // text (see the list rule for more information). This stores
        // the full regex capture object, if there is one.
        latestState.pos = 0;
        latestState.prevCapture = null;
        return nestedParse(preprocess(source), latestState);
    };
    return outerParse;
};

// Creates a match function for an inline scoped element from a regex
export function inlineRegex(regex: RegExp): MatchFunction {
    var match: MatchFunction = function(source, state) {
        if(state.inline) {
            return regex.exec(source);
        } else {
            return null;
        }
    };
    match.regex = regex;
    return match;
};

// Creates a match function for a block scoped element from a regex
export function blockRegex(regex: RegExp): MatchFunction {
    var match: MatchFunction = function(source, state) {
        if(state.inline) {
            return null;
        } else {
            return regex.exec(source);
        }
    };
    match.regex = regex;
    return match;
};

// Creates a match function from a regex, ignoring block/inline scope
export function anyScopeRegex(regex: RegExp): MatchFunction {
    var match: MatchFunction = function(source, state) {
        return regex.exec(source);
    };
    match.regex = regex;
    return match;
};

const TYPE_SYMBOL =
    (typeof Symbol === 'function' && Symbol.for &&
        Symbol.for('react.element')) ||
    0xeac7;

export function reactElement(
    type: string,
    key: string | number | null | undefined,
    props: { [prop: string]: any }
): ReactElement {
    return {
        $$typeof: TYPE_SYMBOL,
        type: type,
        key: key == null ? undefined : key,
        ref: null,
        props: props,
        _owner: null
    } as ReactElement;
};

var EMPTY_PROPS = {};

export function sanitizeUrl(url?: string): string | null {
    if(url == null) {
        return null;
    }
    try {
        var prot = new URL(url, 'https://localhost').protocol
        if(prot.indexOf('javascript:') === 0 || prot.indexOf('vbscript:') === 0 || prot.indexOf('data:') === 0) {
            return null;
        }
    } catch(e) {
        // invalid URLs should throw a TypeError
        // see for instance: `new URL("");`
        return null;
    }
    return url;
}

/*
var SANITIZE_TEXT_R = /[<>&"']/g;
var SANITIZE_TEXT_CODES = {
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    "`": '&#96;'
};

export function sanitizeText(text: Attr): string {
    return String(text).replace(SANITIZE_TEXT_R, function(chr) {
        return SANITIZE_TEXT_CODES[chr];
    });
};
*/

var UNESCAPE_URL_R = /\\([^0-9A-Za-z\s])/g;

export function unescapeUrl(rawUrlString: string): string {
    return rawUrlString.replace(UNESCAPE_URL_R, "$1");
};

/**
 * Parse some content with the parser `parse`, with state.inline
 * set to true. Useful for block elements; not generally necessary
 * to be used by inline elements (where state.inline is already true.
 */
export function parseInline(parse: Parser, content: string, state: State): ASTNode {
    var isCurrentlyInline = state.inline || false;
    state.inline = true;
    var result = parse(content, state);
    state.inline = isCurrentlyInline;
    return result;
}

export function parseBlock(parse: Parser, content: string, state: State): ASTNode {
    var isCurrentlyInline = state.inline || false;
    state.inline = false;
    var result = parse(content + "\n\n", state);
    state.inline = isCurrentlyInline;
    return result;
}

function parseCaptureInline(capture: Capture, parse: Parser, state: State): UnTypedASTNode {
    return {
        content: parseInline(parse, capture[1], state)
    };
}

function ignoreCapture(): UnTypedASTNode { return {}; }

// recognize a `*` `-`, `+`, `1.`, `2.`... list bullet
// var LIST_BULLET = "(?:[*+-]|\\d+\\.)";
// recognize the start of a list item:
// leading space plus a bullet plus a space (`   * `)
// var LIST_ITEM_PREFIX = "( *)(" + LIST_BULLET + ") +";
// var LIST_ITEM_PREFIX_R = new RegExp("^" + LIST_ITEM_PREFIX);
// recognize an individual list item:
//  * hi
//    this is part of the same item
//
//    as is this, which is a new paragraph in the same item
//
//  * but this is not part of the same item
// var LIST_ITEM_R = new RegExp(
//     LIST_ITEM_PREFIX +
//     "[^\\n]*(?:\\n" +
//     "(?!\\1" + LIST_BULLET + " )[^\\n]*)*(\n|$)",
//     "gm"
// );
// var BLOCK_END_R = /\n{2,}$/;
var INLINE_CODE_ESCAPE_BACKTICKS_R = /^ (?= *`)|(` *) $/g;
// recognize the end of a paragraph block inside a list item:
// two or more newlines at end end of the item
// var LIST_BLOCK_END_R = BLOCK_END_R;
// var LIST_ITEM_END_R = / *\n+$/;
// check whether a list item has paragraphs: if it does,
// we leave the newlines at the end
// var LIST_R = new RegExp(
//     "^( *)(" + LIST_BULLET + ") " +
//     "[^]+?(?:\n{2,}(?! )" +
//     "(?!\\1" + LIST_BULLET + " )\\n*" +
//     // the \\s*$ here is so that we can parse the inside of nested
//     // lists, where our content might end before we receive two `\n`s
//     "|\\s*\n*$)"
// );
// var LIST_LOOKBEHIND_R = /(?:^|\n)( *)$/;

var TABLES = (function() {
    // predefine regexes so we don't have to create them inside functions
    // sure, regex literals should be fast, even inside functions, but they
    // aren't in all browsers.
    var TABLE_BLOCK_TRIM = /\n+/g;
    var TABLE_ROW_SEPARATOR_TRIM = /^ *\| *| *\| *$/g;
    var TABLE_CELL_END_TRIM = / *$/;
    var TABLE_RIGHT_ALIGN = /^ *-+: *$/;
    var TABLE_CENTER_ALIGN = /^ *:-+: *$/;
    var TABLE_LEFT_ALIGN = /^ *:-+ *$/;

    function parseTableAlignCapture(alignCapture: string): TableAlignment {
        if(TABLE_RIGHT_ALIGN.test(alignCapture)) {
            return "right";
        } else if(TABLE_CENTER_ALIGN.test(alignCapture)) {
            return "center";
        } else if(TABLE_LEFT_ALIGN.test(alignCapture)) {
            return "left";
        } else {
            return null;
        }
    }

    function parseTableAlign(source: string, parse: Parser, state: State, trimEndSeparators: boolean): Array<TableAlignment> {
        if(trimEndSeparators) {
            source = source.replace(TABLE_ROW_SEPARATOR_TRIM, "");
        }
        var alignText = source.trim().split("|");
        return alignText.map(parseTableAlignCapture);
    }

    function parseTableRow(source: string, parse: Parser, state: State, trimEndSeparators: boolean): Array<SingleASTNode[]> {
        var prevInTable = state.inTable;
        state.inTable = true;
        var tableRow = parse(source.trim(), state);
        state.inTable = prevInTable;

        var cells: Array<SingleASTNode[]> = [[]];
        tableRow.forEach(function(node, i) {
            if(node.type === 'tableSeparator') {
                // Filter out empty table separators at the start/end:
                if(!trimEndSeparators || i !== 0 && i !== tableRow.length - 1) {
                    // Split the current row:
                    cells.push([]);
                }
            } else {
                if(node.type === 'text' && (
                    tableRow[i + 1] == null ||
                    tableRow[i + 1].type === 'tableSeparator'
                )) {
                    node.content = node.content.replace(TABLE_CELL_END_TRIM, "");
                }
                cells[cells.length - 1].push(node);
            }
        });

        return cells;
    }

    function parseTableCells(source: string, parse: Parser, state: State, trimEndSeparators: boolean): Array<ASTNode[]> {
        var rowsText = source.trim().split("\n");

        return rowsText.map(function(rowText) {
            return parseTableRow(rowText, parse, state, trimEndSeparators);
        });
    }

    function parseTable(trimEndSeparators: boolean): SingleNodeParseFunction {
        return function(capture, parse, state) {
            state.inline = true;
            var header = parseTableRow(capture[1], parse, state, trimEndSeparators);
            var align = parseTableAlign(capture[2], parse, state, trimEndSeparators);
            var cells = parseTableCells(capture[3], parse, state, trimEndSeparators);
            state.inline = false;

            return {
                type: "table",
                header: header,
                align: align,
                cells: cells
            };
        };
    }

    return {
        parseTable: parseTable(true),
        parseNpTable: parseTable(false),
        TABLE_REGEX: /^ *(\|.+)\n *\|( *[-:]+[-| :]*)\n((?: *\|.*(?:\n|$))*)\n*/,
        NPTABLE_REGEX: /^ *(\S.*\|.*)\n *([-:]+ *\|[-| :]*)\n((?:.*\|.*(?:\n|$))*)\n*/
    };
})();

/**
 * This match function matches math in `$`s, such as:
 *
 * $y = x + 1$
 *
 * It functions roughly like the following regex:
 * /\$([^\$]*)\$/
 *
 * Unfortunately, math may have other `$`s inside it, as
 * long as they are inside `{` braces `}`, mostly for
 * `\text{ $math$ }`.
 *
 * To parse this, we can't use a regex, since we
 * should support arbitrary nesting (even though
 * MathJax actually only supports two levels of nesting
 * here, which we *could* parse with a regex).
 *
 * Non-regex matchers like this are now a first-class
 * concept in simple-markdown. Yay!
 *
 * This can also match block-math, which is math alone in a paragraph.
 */
function mathMatcher(source: string, state: State, isBlock: boolean) {
    var length = source.length, index = 0;

    // When looking for blocks, skip over leading spaces
    if(isBlock) {
        if(state.inline) {
            return null;
        }

        // match whitespace and increment index it to skip it
        let ws = /^\s+/.exec(source);
        if(ws) {
            index += ws[0].length;
        }
    }

    // Our source must start with a "$", or "$$" for blocks
    if(index >= length || source[index++] !== '$') return null;
    if(isBlock && source[index++] !== '$') return null;

    var startIndex = index, braceLevel = 0, skip;

    // Loop through the source, looking for a closing '$'
    // closing '$'s only count if they are not escaped with
    // a `\`, and we are not in nested `{}` braces.
    while(index < length) {
        var character = source[index];

        if(character === "\\") {
            // Consume both the `\` and the escaped char as a single
            // token.
            // This is so that the second `$` in `$\\$` closes
            // the math expression, since the first `\` is escaping
            // the second `\`, but the second `\` is not escaping
            // the second `$`.
            // This also handles the case of escaping `$`s or
            // braces `\{`
            index++;
        } else if(braceLevel <= 0 && character === "$") {
            var endIndex: number | null = index + 1;
            if(isBlock) {
                // Look for two trailing newlines after the closing `$`
                var match = /^\$(?: *\n){2,}/.exec(source.slice(endIndex));
                endIndex = match ? endIndex + match[0].length : null;
            }

            // Return an array that looks like the results of a
            // regex's .exec function:
            // capture[0] is the whole string
            // capture[1] is the first "paren" match, which is the
            //   content of the math here, as if we wrote the regex
            //   /\$([^\$]*)\$/
            if(endIndex) {
                let content = source.substring(startIndex, index);
                if(content.length > 0) return [source.substring(0, endIndex), content];
            }
            break;
        } else if(character === "{") {
            braceLevel++;
        } else if(character === "}") {
            braceLevel--;
        } else if(character === "\n" && !isBlock) {
            break;
        }

        index++;
    }

    // we didn't find a closing `$`
    return null;
};
function mathMatch(source: string, state: State) { return mathMatcher(source, state, false) };
function blockMathMatch(source: string, state: State) { return mathMatcher(source, state, true) };

var LINK_INSIDE = "(?:\\[[^\\]]*\\]|[^\\[\\]]|\\](?=[^\\[]*\\]))*";
var LINK_HREF_AND_TITLE =
    "\\s*<?((?:\\([^)]*\\)|[^\\s\\\\]|\\\\.)*?)>?(?:\\s+['\"]([^]*?)['\"])?\\s*";
var AUTOLINK_MAILTO_CHECK_R = /mailto:/i;

function parseRef(capture: Capture, state: State, refNode: RefNode): RefNode {
    var ref = (capture[2] || capture[1])
        .replace(/\s+/g, ' ')
        .toLowerCase();

    // We store information about previously seen defs on
    // state._defs (_ to deconflict with client-defined
    // state). If the def for this reflink/refimage has
    // already been seen, we can use its target/source
    // and title here:
    if(state._defs && state._defs[ref]) {
        var def = state._defs[ref];
        // `refNode` can be a link or an image. Both use
        // target and title properties.
        refNode.target = def.target;
        refNode.title = def.title;
    }

    // In case we haven't seen our def yet (or if someone
    // overwrites that def later on), we add this node
    // to the list of ref nodes for that def. Then, when
    // we find the def, we can modify this link/image AST
    // node :).
    // I'm sorry.
    state._refs = state._refs || {};
    state._refs[ref] = state._refs[ref] || [];
    state._refs[ref].push(refNode);

    return refNode;
}

var currOrder = 0;

export const defaultRules: DefaultRules = {
    Array: {
        react: function(arr, output, state) {
            var oldKey = state.key, result: Array<ReactElements> = [];

            // map output over the ast, except group any text
            // nodes together into a single string output.
            for(var i = 0, key = 0; i < arr.length; i++, key++) {
                // `key` is our numerical `state.key`, which we increment for
                // every output node, but don't change for joined text nodes.
                // (i, however, must change for joined text nodes)
                state.key = '' + i;

                var node = arr[i];
                if(node.type === 'text') {
                    node = { type: 'text', content: node.content };
                    for(; i + 1 < arr.length && arr[i + 1].type === 'text'; i++) {
                        node.content += arr[i + 1].content;
                    }
                }

                result.push(output(node, state));
            }

            state.key = oldKey;
            return result;
        },
    },
    heading: {
        order: currOrder++,
        match: blockRegex(/^(#{1,6}) +([^\n]+?)#* *(?:\n *)+\n/),
        parse: function(capture, parse, state) {
            return {
                level: capture[1].length,
                content: parseInline(parse, capture[2].trim(), state)
            };
        },
        react: function(node, output, state) {
            return reactElement(
                'h' + node.level,
                state.key,
                {
                    children: output(node.content, state)
                }
            );
        },
    },
    nptable: {
        order: currOrder++,
        match: blockRegex(TABLES.NPTABLE_REGEX),
        parse: TABLES.parseNpTable,
        react: null,
    },
    lheading: {
        order: currOrder++,
        match: blockRegex(/^([^\n]+)\n *(=|-){3,} *(?:\n *)+\n/),
        parse: function(capture, parse, state) {
            return {
                type: "heading",
                level: capture[2] === '=' ? 1 : 2,
                content: parseInline(parse, capture[1], state)
            };
        },
        react: null,
    },
    hr: {
        order: currOrder++,
        match: blockRegex(/^( *[-*_]){3,} *(?:\n *)+\n/),
        parse: ignoreCapture,
        react: function(node, output, state) {
            return reactElement(
                'hr',
                state.key,
                EMPTY_PROPS
            );
        },
    },
    codeBlock: {
        order: currOrder++,
        //match: blockRegex(/^(?:    [^\n]+\n*)+(?:\n *)+\n/),
        //match: blockRegex(/^ *(`{3,}|~{3,}) *(?:(\S+) *)?\n([^]+?)\n?\1 *(?:\n *)+\n/),
        match: anyScopeRegex(/^ *(`{3,}) *(?:(\S+) *)?\n([^]+?)\n?\1(?:\n+|$)/),
        parse: function(capture, parse, state) {
            //var content = capture[0]
            //    .replace(/^    /gm, '')
            //    .replace(/\n+$/, '');
            //return {
            //    lang: undefined,
            //    content: content
            //};

            return {
                //type: "codeBlock",
                lang: capture[2] || undefined,
                content: capture[3]
            };
        },
        react: function(node, output, state) {
            return <Code key={state.key} src={node.content} language={node.lang} />
        }
    },
    blockMath: {
        order: currOrder++,
        match: blockMathMatch,
        parse: (capture, parse, state) => {
            return { content: capture[1] };
        },
        react: (node, output, state) => {
            return <Math key={state.key} src={node.content} />;
        },
    },
    //fence: {
    //    order: currOrder++,
    //    match: ,
    //    parse: function(capture, parse, state) {
    //
    //    },
    //    react: null,
    //},
    blockQuote: {
        order: currOrder++,
        // NOTE: Modified from original to take up to 5 levels and require a space after >
        match: blockRegex(/^( *>{1,5} +[^\n]+(\n[^\n]+)*\n*)+\n{2,}/),
        parse: function(capture, parse, state) {
            // trim first blockquote >
            var content = capture[0].replace(/^ *> ?/gm, '');
            return {
                content: parse(content, state)
            };
        },
        react: function(node, output, state) {
            return reactElement(
                'blockquote',
                state.key,
                {
                    children: output(node.content, state)
                }
            );
        }
    },
    // list: {
    //     order: currOrder++,
    //     match: function(source, state) {
    //         // We only want to break into a list if we are at the start of a
    //         // line. This is to avoid parsing "hi * there" with "* there"
    //         // becoming a part of a list.
    //         // You might wonder, "but that's inline, so of course it wouldn't
    //         // start a list?". You would be correct! Except that some of our
    //         // lists can be inline, because they might be inside another list,
    //         // in which case we can parse with inline scope, but need to allow
    //         // nested lists inside this inline scope.
    //         var prevCaptureStr = state.prevCapture == null ? "" : state.prevCapture[0];
    //         var isStartOfLineCapture = LIST_LOOKBEHIND_R.exec(prevCaptureStr);
    //         var isListBlock = state._list || !state.inline;

    //         if(isStartOfLineCapture && isListBlock) {
    //             source = isStartOfLineCapture[1] + source;
    //             return LIST_R.exec(source);
    //         } else {
    //             return null;
    //         }
    //     },
    //     parse: function(capture, parse, state) {
    //         var bullet = capture[2];
    //         var ordered = bullet.length > 1;
    //         var start = ordered ? +bullet : undefined;
    //         var items: string[] = capture[0]
    //             .replace(LIST_BLOCK_END_R, "\n")
    //             .match(LIST_ITEM_R)!;

    //         // We know this will match here, because of how the regexes are
    //         // defined
    //         var lastItemWasAParagraph = false;
    //         var itemContent = items.map(function(item: string, i: number) {
    //             // We need to see how far indented this item is:
    //             var prefixCapture = LIST_ITEM_PREFIX_R.exec(item);
    //             var space = prefixCapture ? prefixCapture[0].length : 0;
    //             // And then we construct a regex to "unindent" the subsequent
    //             // lines of the items by that amount:
    //             var spaceRegex = new RegExp("^ {1, " + space + "}", "gm");

    //             // Before processing the item, we need a couple things
    //             var content = item
    //                 // remove indents on trailing lines:
    //                 .replace(spaceRegex, '')
    //                 // remove the bullet:
    //                 .replace(LIST_ITEM_PREFIX_R, '');

    //             // Handling "loose" lists, like:
    //             //
    //             //  * this is wrapped in a paragraph
    //             //
    //             //  * as is this
    //             //
    //             //  * as is this
    //             var isLastItem = (i === items.length - 1);
    //             var containsBlocks = content.indexOf("\n\n") !== -1;

    //             // Any element in a list is a block if it contains multiple
    //             // newlines. The last element in the list can also be a block
    //             // if the previous item in the list was a block (this is
    //             // because non-last items in the list can end with \n\n, but
    //             // the last item can't, so we just "inherit" this property
    //             // from our previous element).
    //             var thisItemIsAParagraph = containsBlocks ||
    //                 (isLastItem && lastItemWasAParagraph);
    //             lastItemWasAParagraph = thisItemIsAParagraph;

    //             // backup our state for restoration afterwards. We're going to
    //             // want to set state._list to true, and state.inline depending
    //             // on our list's looseness.
    //             var oldStateInline = state.inline;
    //             var oldStateList = state._list;
    //             state._list = true;

    //             // Parse inline if we're in a tight list, or block if we're in
    //             // a loose list.
    //             var adjustedContent;
    //             if(thisItemIsAParagraph) {
    //                 state.inline = false;
    //                 adjustedContent = content.replace(LIST_ITEM_END_R, "\n\n");
    //             } else {
    //                 state.inline = true;
    //                 adjustedContent = content.replace(LIST_ITEM_END_R, "");
    //             }

    //             var result = parse(adjustedContent, state);

    //             // Restore our state before returning
    //             state.inline = oldStateInline;
    //             state._list = oldStateList;
    //             return result;
    //         });

    //         return {
    //             ordered: ordered,
    //             start: start,
    //             items: itemContent
    //         };
    //     },
    //     react: function(node, output, state) {
    //         var ListWrapper = node.ordered ? "ol" : "ul";

    //         return reactElement(
    //             ListWrapper,
    //             state.key,
    //             {
    //                 start: node.start,
    //                 children: node.items.map(function(item: ASTNode, i: number) {
    //                     return reactElement(
    //                         'li',
    //                         '' + i,
    //                         {
    //                             children: output(item, state)
    //                         }
    //                     );
    //                 })
    //             }
    //         );
    //     }
    // },

    // def: {
    //     order: currOrder++,
    //     // TODO(aria): This will match without a blank line before the next
    //     // block element, which is inconsistent with most of the rest of
    //     // simple-markdown.
    //     match: blockRegex(
    //         /^ *\[([^\]]+)\]: *<?([^\s>]*)>?(?: +["(]([^\n]+)[")])? *\n(?: *\n)*/
    //     ),
    //     parse: function(capture, parse, state) {
    //         var def = capture[1]
    //             .replace(/\s+/g, ' ')
    //             .toLowerCase();
    //         var target = capture[2];
    //         var title = capture[3];

    //         // Look for previous links/images using this def
    //         // If any links/images using this def have already been declared,
    //         // they will have added themselves to the state._refs[def] list
    //         // (_ to deconflict with client-defined state). We look through
    //         // that list of reflinks for this def, and modify those AST nodes
    //         // with our newly found information now.
    //         // Sorry :(.
    //         if(state._refs && state._refs[def]) {
    //             // `refNode` can be a link or an image
    //             state._refs[def].forEach(function(refNode: RefNode) {
    //                 refNode.target = target;
    //                 refNode.title = title;
    //             });
    //         }

    //         // Add this def to our map of defs for any future links/images
    //         // In case we haven't found any or all of the refs referring to
    //         // this def yet, we add our def to the table of known defs, so
    //         // that future reflinks can modify themselves appropriately with
    //         // this information.
    //         state._defs = state._defs || {};
    //         state._defs[def] = {
    //             target: target,
    //             title: title,
    //         };

    //         // return the relevant parsed information
    //         // for debugging only.
    //         return {
    //             def: def,
    //             target: target,
    //             title: title,
    //         };
    //     },
    //     react: function() { return null; }
    // },

    table: {
        order: currOrder++,
        match: blockRegex(TABLES.TABLE_REGEX),
        parse: TABLES.parseTable,
        react: function(node, output, state) {
            var getStyle = function(colIndex: number): { [attr: string]: Attr } {
                return node.align[colIndex] == null ? {} : {
                    textAlign: node.align[colIndex]
                };
            };

            var headers = node.header.map(function(
                content: ASTNode,
                i: number,
            ) {
                return reactElement(
                    'th',
                    '' + i,
                    {
                        style: getStyle(i),
                        scope: 'col',
                        children: output(content, state)
                    }
                );
            });

            var rows = node.cells.map(function(row: ASTNode, r: number) {
                return reactElement(
                    'tr',
                    '' + r,
                    {
                        children: row.map(function(content: ASTNode, c: number) {
                            return reactElement(
                                'td',
                                '' + c,
                                {
                                    style: getStyle(c),
                                    children: output(content, state)
                                }
                            );
                        })
                    }
                );
            });

            return reactElement(
                'table',
                state.key,
                {
                    children: [reactElement(
                        'thead',
                        'thead',
                        {
                            children: reactElement(
                                'tr',
                                null,
                                {
                                    children: headers
                                }
                            )
                        }
                    ), reactElement(
                        'tbody',
                        'tbody',
                        {
                            children: rows
                        }
                    )]
                }
            );
        }
    },
    newline: {
        order: currOrder++,
        match: blockRegex(/^(?:\n *)*\n/),
        parse: ignoreCapture,
        react: function(node, output, state) { return "\n"; }
    },
    paragraph: {
        order: currOrder++,
        match: blockRegex(/^((?:[^\n]|\n(?! *\n))+)(?:\n *)+\n/),
        parse: parseCaptureInline,
        react: function(node, output, state) {
            return reactElement(
                'div',
                state.key,
                {
                    className: 'p',
                    children: output(node.content, state)
                }
            );
        }
    },
    escape: {
        order: currOrder++,
        // We don't allow escaping numbers, letters, or spaces here so that
        // backslashes used in plain text still get rendered. But allowing
        // escaping anything else provides a very flexible escape mechanism,
        // regardless of how this grammar is extended.
        match: inlineRegex(/^\\([^0-9A-Za-z\s])/),
        parse: function(capture, parse, state) {
            return {
                type: "text",
                content: capture[1]
            };
        },
        react: null
    },
    tableSeparator: {
        order: currOrder++,
        match: function(source, state) {
            if(!state.inTable) {
                return null;
            }
            return /^ *\| */.exec(source);
        },
        parse: function() {
            return { type: 'tableSeparator' };
        },
        // These shouldn't be reached, but in case they are, be reasonable:
        react: function() { return ' | '; },
    },
    autolink: {
        order: currOrder++,
        match: inlineRegex(/^<([^: >]+:\/[^ >]+)>/),
        parse: function(capture, parse, state) {
            // NOTE: This disables links and embeds
            return {
                type: "text",
                content: capture[1],
            };

            //return {
            //    type: "link",
            //    content: [{
            //        type: "text",
            //        content: capture[1]
            //    }],
            //    target: capture[1]
            //};
        },
        react: null
    },
    mailto: {
        order: currOrder++,
        match: inlineRegex(/^<([^@\s]{1,64}@[^@\s]+\.[^@\s]+)>/),
        //match: inlineRegex(/^<([^ >]+@[^ >]+)>/),
        parse: function(capture, parse, state) {
            var address = capture[1];
            var target = capture[1];

            // Check for a `mailto:` already existing in the link:
            if(!AUTOLINK_MAILTO_CHECK_R.test(target)) {
                target = "mailto:" + target;
            }

            return {
                type: "link",
                content: [{
                    type: "text",
                    content: address
                }],
                target: target
            };
        },
        react: null
    },
    url: {
        order: currOrder++,
        match: inlineRegex(/^(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/),
        parse: function(capture, parse, state) {
            return {
                type: "link",
                content: [{
                    type: "text",
                    content: capture[1]
                }],
                target: capture[1],
                title: undefined
            };
        },
        react: null
    },
    math: {
        order: currOrder++,
        match: mathMatch,
        parse: (capture, parse, state) => {
            return {
                content: capture[1],
            };
        },
        react: (node, output, state) => {
            return (
                <Math key={state.key} src={node.content} inline />
            )
        },
    },
    unescapedDollar: {
        order: currOrder++,
        match: inlineRegex(/^(?!\\)\$/),
        parse: (capture, parse, state) => {
            return {};
        },
        react: (node, output, state) => {
            // Unescaped dollar signs render correctly, but result in
            // untranslatable text after the i18n python linter flags it
            return "$" as any;
        },
    },
    link: {
        order: currOrder++,
        match: inlineRegex(new RegExp(
            "^\\[(" + LINK_INSIDE + ")\\]\\(" + LINK_HREF_AND_TITLE + "\\)"
        )),
        parse: function(capture, parse, state) {
            return {
                content: parse(capture[1], state),
                target: unescapeUrl(capture[2]),
                title: capture[3]
            };
        },
        react: function(node, output, state) {
            return reactElement(
                'a',
                state.key,
                {
                    href: sanitizeUrl(node.target),
                    title: node.title,
                    target: '_blank',
                    children: output(node.content, state)
                }
            );
        }
    },
    image: {
        order: currOrder++,
        match: inlineRegex(new RegExp(
            "^!\\[(" + LINK_INSIDE + ")\\]\\(" + LINK_HREF_AND_TITLE + "\\)"
        )),
        parse: function(capture, parse, state) {
            return {
                alt: capture[1],
                target: unescapeUrl(capture[2]),
                title: capture[3]
            };
        },
        react: function(node, output, state) {
            return reactElement(
                'img',
                state.key,
                {
                    src: sanitizeUrl(node.target),
                    alt: node.alt,
                    title: node.title
                }
            );
        }
    },
    //reflink: {
    //    order: currOrder++,
    //    match: inlineRegex(new RegExp(
    //        // The first [part] of the link
    //        "^\\[(" + LINK_INSIDE + ")\\]" +
    //        // The [ref] target of the link
    //        "\\s*\\[([^\\]]*)\\]"
    //    )),
    //    parse: function(capture, parse, state) {
    //        return parseRef(capture, state, {
    //            type: "link",
    //            content: parse(capture[1], state)
    //        });
    //    },
    //    react: null
    //},
    //refimage: {
    //    order: currOrder++,
    //    match: inlineRegex(new RegExp(
    //        // The first [part] of the link
    //        "^!\\[(" + LINK_INSIDE + ")\\]" +
    //        // The [ref] target of the link
    //        "\\s*\\[([^\\]]*)\\]"
    //    )),
    //    parse: function(capture, parse, state) {
    //        return parseRef(capture, state, {
    //            type: "image",
    //            alt: capture[1]
    //        });
    //    },
    //    react: null
    //},

    em: {
        order: currOrder /* same as strong/u */,
        match: inlineRegex(
            new RegExp(
                // only match _s surrounding words.
                "^\\b_" +
                "((?:__|\\\\[^]|[^\\\\_])+?)_" +
                "\\b" +
                // Or match *s:
                "|" +
                // Only match *s that are followed by a non-space:
                "^\\*(?=\\S)(" +
                // Match at least one of:
                "(?:" +
                //  - `**`: so that bolds inside italics don't close the
                //          italics
                "\\*\\*|" +
                //  - escape sequence: so escaped *s don't close us
                "\\\\[^]|" +
                //  - whitespace: followed by a non-* (we don't
                //          want ' *' to close an italics--it might
                //          start a list)
                "\\s+(?:\\\\[^]|[^\\s\\*\\\\]|\\*\\*)|" +
                //  - non-whitespace, non-*, non-backslash characters
                "[^\\s\\*\\\\]" +
                ")+?" +
                // followed by a non-space, non-* then *
                ")\\*(?!\\*)"
            )
        ),
        quality: function(capture) {
            // precedence by length, `em` wins ties:
            return capture[0].length + 0.2;
        },
        parse: function(capture, parse, state) {
            return {
                content: parse(capture[2] || capture[1], state)
            };
        },
        react: function(node, output, state) {
            return reactElement(
                'em',
                state.key,
                {
                    children: output(node.content, state)
                }
            );
        }
    },
    strong: {
        order: currOrder /* same as em */,
        match: inlineRegex(/^\*\*((?:\\[^]|[^\\])+?)\*\*(?!\*)/),
        quality: function(capture) {
            // precedence by length, wins ties vs `u`:
            return capture[0].length + 0.1;
        },
        parse: parseCaptureInline,
        react: function(node, output, state) {
            return reactElement(
                'strong',
                state.key,
                {
                    children: output(node.content, state)
                }
            );
        }
    },
    u: {
        order: currOrder++ /* same as em&strong; increment for next rule */,
        match: inlineRegex(/^__((?:\\[^]|[^\\])+?)__(?!_)/),
        quality: function(capture) {
            // precedence by length, loses all ties
            return capture[0].length;
        },
        parse: parseCaptureInline,
        react: function(node, output, state) {
            return reactElement(
                'u',
                state.key,
                {
                    children: output(node.content, state)
                }
            );
        }
    },
    del: {
        order: currOrder++,
        match: inlineRegex(/^~~(?=\S)((?:\\[^]|~(?!~)|[^\s~\\]|\s(?!~~))+?)~~/),
        parse: parseCaptureInline,
        react: function(node, output, state) {
            return reactElement(
                'del',
                state.key,
                {
                    children: output(node.content, state)
                }
            );
        }
    },
    tags: {
        order: currOrder++,
        match: inlineRegex(/^<(sup|sub)>([^\n]+)<\/\1>/),
        parse: function(capture, parse, state) {
            let tag = capture[1], content = capture[2], tagDepth = state.tagDepth || 0;

            if(tagDepth < 2) {
                state.tagDepth = tagDepth + 1;
                let parsed = parse(content, state);
                state.tagDepth -= 1;

                return { tag, content: parsed };
            }

            return [
                {
                    type: "text",
                    content: "<" + tag + ">",
                },
                parse(content, state),
                {
                    type: "text",
                    content: "</" + tag + ">"
                }
            ];

        },
        react: function(node, output, state) {
            return reactElement(
                node.tag,
                state.key,
                {
                    children: output(node.content, state),
                }
            )
        }
    },
    spoiler: {
        order: currOrder,
        match: function(source) {
            return /^\|\|([^]+?)\|\|(?!\|)/.exec(source);
        },
        parse: function(capture, parse, state) {
            return { content: parse(capture[1], state) };
        },
        react: function(node, output, state) {
            return <Spoiler key={state.key}>{output(node.content, state)}</Spoiler>;
        },
    },
    inlineCode: {
        order: currOrder++,
        match: inlineRegex(/^(`+)([^]*?[^`])\1(?!`)/),
        parse: function(capture, parse, state) {
            return {
                content: capture[2].replace(INLINE_CODE_ESCAPE_BACKTICKS_R, "$1")
            };
        },
        react: function(node, output, state) {
            return reactElement(
                'code',
                state.key,
                {
                    children: node.content
                }
            );
        }
    },
    br: {
        order: currOrder++,
        match: anyScopeRegex(/^ {2,}\n/),
        parse: ignoreCapture,
        react: function(node, output, state) {
            return reactElement(
                'br',
                state.key,
                EMPTY_PROPS
            );
        }
    },
    text: {
        order: currOrder++,
        // Here we look for anything followed by non-symbols,
        // double newlines, or double-space-newlines
        // We break on any symbol characters so that this grammar
        // is easy to extend without needing to modify this regex
        match: anyScopeRegex(
            /^[^]+?(?=[^0-9A-Za-z\s\u00c0-\uffff]|\n\n| {2,}\n|\w+:\S|$)/
        ),
        parse: function(capture, parse, state) {
            return {
                content: capture[0]
            };
        },
        react: function(node, output, state) {
            return node.content;
        }
    }
};

export function outputFor(
    rules: OutputRules<'react'>,
    defaultState?: State
) {
    var latestState: State;
    var arrayRule: ReactArrayRule = (rules.Array || defaultRules.Array) as ReactArrayRule;
    var arrayRuleOutput = arrayRule.react;

    var nestedOutput: Output<any> = function(ast: ASTNode, state?: State) {
        state = state || latestState;
        latestState = state;
        if(Array.isArray(ast)) {
            return arrayRuleOutput(ast, nestedOutput, state);
        } else {
            return (rules[ast.type!] as ReactArrayRule).react(ast as any, nestedOutput, state);
        }
    };

    var outerOutput: Output<any> = function(ast: ASTNode, state?: State) {
        latestState = populateInitialState(state, defaultState);
        return nestedOutput(ast, latestState);
    };

    return outerOutput;
};

export const defaultRawParse = parserFor(defaultRules);
export const defaultReactOutput: ReactOutput = outputFor(defaultRules as any);

/*
export function defaultBlockParse(source: string, state?: State): Array<SingleASTNode> {
    state = state || {};
    state.inline = false;
    return defaultRawParse(source, state);
}

export function defaultInlineParse(source: string, state?: State): Array<SingleASTNode> {
    state = state || {};
    state.inline = true;
    return defaultRawParse(source, state);
}

export function defaultImplicitParse(source: string, state?: State): Array<SingleASTNode> {
    var isBlock = BLOCK_END_R.test(source);
    state = state || {};
    state.inline = !isBlock;
    return defaultRawParse(source, state);
}
*/

export function ReactMarkdown(props: ReactMarkdownProps): ReactElement {
    var divProps: any = {};

    for(var prop in props) {
        if(prop !== 'source' && Object.prototype.hasOwnProperty.call(props, prop)) {
            divProps[prop] = props[prop];
        }
    }

    let state = { inline: !!props.inline };
    divProps.children = defaultReactOutput(defaultRawParse(props.source, state), state);

    return reactElement(
        'div',
        null,
        divProps
    );
};
