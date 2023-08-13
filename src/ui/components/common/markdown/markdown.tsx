import { JSX, splitProps } from "solid-js";

import { Spoiler } from "./components/spoiler";
import { Math } from "./lazy";
//import Math from "./components/math";
import { CodeWrapper } from "./components/code_wrapper";

import { compareString } from "lib/compare";
import { insert } from "solid-js/web";
import { ALIASES_REV, decode_emojis, EMOJI_RE0, find_emoji } from "lib/emoji";
import { CustomEmote, Emoji } from "../emoji";

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
    [prop: string]: any;
}

export type ASTNode = SingleASTNode | Array<SingleASTNode>;

export interface State {
    key?: string | number | undefined;
    inline?: boolean | undefined;
    pos?: number,
    last?: boolean,
    extra?: JSX.Element,
    no_text?: boolean,
    had_emoji?: boolean,
    [prop: string]: any,
}
export type OptionalState = State | null | undefined;

export type SolidElement = JSX.Element;
export type SolidElements = JSX.ArrayElement | JSX.Element;

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


export type SolidOutput = Output<SolidElements>;
export type SolidNodeOutput = NodeOutput<SolidElements>;
export type HtmlOutput = Output<string>;
export type HtmlNodeOutput = NodeOutput<string>;

export interface ParserRule {
    readonly o: number,
    readonly m: MatchFunction,
    readonly q?: (capture: Capture, state: State, prevCapture: string) => number,
    readonly p: ParseFunction,
}


export interface SingleNodeParserRule extends ParserRule {
    readonly o: number,
    readonly m: MatchFunction,
    readonly q?: (capture: Capture, state: State, prevCapture: string) => number,
    readonly p: SingleNodeParseFunction,
}

export interface SolidOutputRule {
    // we allow null because some rules are never output results, and that's
    // legal as long as no parsers return an AST node matching that rule.
    // We don't use ? because this makes it be explicitly defined as either
    // a valid function or null, so it can't be forgotten.
    readonly h: SolidNodeOutput | null,
}

export interface ArrayRule {
    readonly h?: ArrayNodeOutput<SolidElements>,
    readonly [other: string]: ArrayNodeOutput<any> | undefined,
}
export interface SolidArrayRule extends ArrayRule {
    readonly h: ArrayNodeOutput<SolidElements>,
}
export interface DefaultArrayRule extends ArrayRule {
    readonly h: ArrayNodeOutput<SolidElements>,
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
export interface SolidRules {
    readonly Array?: SolidArrayRule,
    readonly [type: string]: ParserRule & SolidOutputRule | SolidArrayRule | undefined,
}

// We want to clarify our defaultRules types a little bit more so clients can
// reuse defaultRules built-ins. So we make some stronger guarantess when
// we can:
export interface NonNullSolidOutputRule extends SolidOutputRule {
    readonly h: SolidNodeOutput,
}
export interface ElementSolidOutputRule extends SolidOutputRule {
    readonly h: RefiningNodeOutput<SolidElements, SolidElement>,
}
export interface TextSolidOutputRule extends SolidOutputRule {
    readonly h: RefiningNodeOutput<SolidElements, string>,
}

export type DefaultInRule = SingleNodeParserRule & SolidOutputRule;
export type TextInOutRule = SingleNodeParserRule & TextSolidOutputRule;
export type LenientInOutRule = SingleNodeParserRule & NonNullSolidOutputRule;
export type DefaultInOutRule = SingleNodeParserRule & ElementSolidOutputRule;

type DefaultRulesIndexer = SolidRules;
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
    readonly font: DefaultInOutRule,
    readonly color: DefaultInOutRule,
    readonly list: DefaultInOutRule,
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
    //readonly link: DefaultInOutRule,
    //readonly image: DefaultInOutRule,
    //readonly reflink: DefaultInRule,
    //readonly refimage: DefaultInRule,
    readonly em: DefaultInOutRule,
    readonly custom_emote: DefaultInOutRule,
    readonly strong: DefaultInOutRule,
    readonly u: DefaultInOutRule,
    readonly spoiler: DefaultInOutRule,
    readonly del: DefaultInOutRule,
    readonly wbr: DefaultInOutRule,
    readonly tags: DefaultInOutRule,
    readonly inlineCode: DefaultInOutRule,
    readonly br: DefaultInOutRule,
    readonly emoji_alias: DefaultInOutRule,
    readonly emoji: DefaultInOutRule,
    readonly text: TextInOutRule,
}

export interface RefNode {
    type: string,
    c?: ASTNode,
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


const CR_NEWLINE_R = /\r\n?/g, TAB_R = /\t/g, FORMFEED_R = /\f/g;

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
        if(rule == null || rule.m == null) {
            return false;
        }
        var order = rule.o;
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
        let ruleA: ParserRule = rules[typeA] as any;
        let ruleB: ParserRule = rules[typeB] as any;
        let orderA = ruleA.o;
        let orderB = ruleB.o;

        // First sort based on increasing order
        if(orderA !== orderB) {
            return orderA - orderB;
        }

        let secondaryOrderA = ruleA.q ? 0 : 1;
        let secondaryOrderB = ruleB.q ? 0 : 1;

        if(secondaryOrderA !== secondaryOrderB) {
            return secondaryOrderA - secondaryOrderB;
        } else {
            // Then based on increasing unicode lexicographic ordering
            return compareString(typeA, typeB);
        }

        //} else if(typeA < typeB) {
        //    return -1;
        //} else if(typeA > typeB) {
        //    return 1;
        //
        //} else {
        //    // Rules should never have the same name,
        //    // but this is provided for completeness.
        //    return 0;
        //}
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
                var currOrder = currRule.o;
                var prevCaptureStr = state.prevCapture == null ? "" : state.prevCapture[0];
                var currCapture = currRule.m(source, state, prevCaptureStr);

                if(currCapture) {
                    var currQuality = currRule.q ? currRule.q(
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
                        currRule.o === currOrder &&
                        currRule.q
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

            var parsed = rule.p(capture, nestedParse, state);
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
    var match: MatchFunction = source => regex.exec(source);
    match.regex = regex;
    return match;
};


var EMPTY_PROPS = {};

export function sanitizeUrl(url?: string): string | undefined {
    if(typeof url === 'string') {
        try {
            var prot = new URL(url, 'https://localhost').protocol;
            if(prot.indexOf('javascript:') === 0 || prot.indexOf('vbscript:') === 0 || prot.indexOf('data:') === 0) {
                return;
            }
        } catch(e) {
            // invalid URLs should throw a TypeError
            // see for instance: `new URL("");`
            return;
        }
        return url;
    }
    return;
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

const UNESCAPE_URL_R = /\\([^0-9A-Za-z\s])/g;

export function unescapeUrl(rawUrlString: string): string {
    return rawUrlString.replace(UNESCAPE_URL_R, "$1");
};

/**
 * Parse some content with the parser `parse`, with state.inline
 * set to true. Useful for block elements; not generally necessary
 * to be used by inline elements (where state.inline is already true.
 */
export function parseInline(parse: Parser, c: string, state: State): ASTNode {
    var isCurrentlyInline = state.inline || false;
    state.inline = true;
    var result = parse(c, state);
    state.inline = isCurrentlyInline;
    return result;
}

export function parseBlock(parse: Parser, c: string, state: State): ASTNode {
    var isCurrentlyInline = state.inline || false;
    state.inline = false;
    var result = parse(c + "\n\n", state);
    state.inline = isCurrentlyInline;
    return result;
}

function parseCaptureInline(capture: Capture, parse: Parser, state: State): UnTypedASTNode {
    return {
        c: parseInline(parse, capture[1], state)
    };
}

function ignoreCapture(): UnTypedASTNode { return {}; }

// recognize a `*` `-`, `+`, `1.`, `2.`... list bullet
var LIST_BULLET = "(?:[*+-]|\\d+\\.)";
// recognize the start of a list item:
// leading space plus a bullet plus a space (`   * `)
var LIST_ITEM_PREFIX = "( *)(" + LIST_BULLET + ") +";
var LIST_ITEM_PREFIX_R = new RegExp("^" + LIST_ITEM_PREFIX);
// recognize an individual list item:
//  * hi
//    this is part of the same item
//
//    as is this, which is a new paragraph in the same item
//
//  * but this is not part of the same item
var LIST_ITEM_R = new RegExp(
    LIST_ITEM_PREFIX +
    "[^\\n]*(?:\\n(?!\\1" + LIST_BULLET + " )[^\\n]*)*(\n|$)",
    "gm",
);

var BLOCK_END_R = /\n{2,}$/;
const INLINE_CODE_ESCAPE_BACKTICKS_R = /^ (?= *`)|(` *) $/g;
// recognize the end of a paragraph block inside a list item:
// two or more newlines at end end of the item
var LIST_BLOCK_END_R = BLOCK_END_R;
var LIST_ITEM_END_R = / *\n+$/;

// check whether a list item has paragraphs: if it does,
// we leave the newlines at the end
var LIST_R = new RegExp(
    "^( *)(" +
    LIST_BULLET +
    ") " +
    "[\\s\\S]+?(?:\n{2,}(?! )" +
    "(?!\\1" +
    LIST_BULLET +
    " )\\n*" +
    // the \\s*$ here is so that we can parse the inside of nested
    // lists, where our content might end before we receive two `\n`s
    "|\\s*\n*$)",
);
var LIST_LOOKBEHIND_R = /(?:^|\n)( *)$/;


const TABLES = (function() {
    // predefine regexes so we don't have to create them inside functions
    // sure, regex literals should be fast, even inside functions, but they
    // aren't in all browsers.
    const TABLE_BLOCK_TRIM = /\n+/g;
    const TABLE_ROW_SEPARATOR_TRIM = /^ *\| *| *\| *$/g;
    const TABLE_CELL_END_TRIM = / *$/;
    const TABLE_RIGHT_ALIGN = /^ *-+: *$/;
    const TABLE_CENTER_ALIGN = /^ *:-+: *$/;
    const TABLE_LEFT_ALIGN = /^ *:-+ *$/;

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
                    node.c = node.c.replace(TABLE_CELL_END_TRIM, "");
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
        pT: parseTable(true),
        pNP: parseTable(false),
        T: /^ *(\|.+)\n *\|( *[-:]+[-| :]*)\n((?: *\|.*(?:\n|$))*)\n*/,
        NP: /^ *(\S.*\|.*)\n *([-:]+ *\|[-| :]*)\n((?:.*\|.*(?:\n|$))*)\n*/
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
function mathMatch(source: string, state: State) { return mathMatcher(source, state, false); };
function blockMathMatch(source: string, state: State) { return mathMatcher(source, state, true); };

const LINK_INSIDE = "(?:\\[[^\\]]*\\]|[^\\[\\]]|\\](?=[^\\[]*\\]))*";
const LINK_HREF_AND_TITLE =
    "\\s*<?((?:\\([^)]*\\)|[^\\s\\\\]|\\\\.)*?)>?(?:\\s+['\"]([^]*?)['\"])?\\s*";
const AUTOLINK_MAILTO_CHECK_R = /mailto:/i;

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

// TODO: Design more prefixes
const SKIN_TONE_PREFIXES = [
    'skin-tone-'
];

function eat(e: Event) {
    e.stopPropagation();
}

var currOrder = 0;

export const defaultRules: DefaultRules = {
    Array: {
        h: (arr, output, state) => {
            let result = [];

            for(let i = 0; i < arr.length; i++) {
                let node = arr[i];

                // merge adjacent text nodes
                if(node.type === 'text') {
                    node = { type: 'text', c: node.c };
                    for(; i + 1 < arr.length && arr[i + 1].type === 'text'; i++) {
                        node.c += arr[i + 1].c;
                    }
                }

                // if last node in array (used in paragraph)
                state.last = i + 1 == arr.length;
                result.push(output(node, state));
            }

            return result;
        }
    },
    heading: {
        o: currOrder++,
        m: blockRegex(/^(#{1,6}) +([^\n]+?)#* *(?:\n *)+\n/),
        p: (capture, parse, state) => {
            return {
                level: capture[1].length,
                c: parseInline(parse, capture[2].trim(), state)
            };
        },
        h: (node, output, state) => {
            let el = document.createElement('h' + node.level);
            insert(el, output(node.c, state));
            return el;
        },
    },
    nptable: {
        o: currOrder++,
        m: blockRegex(TABLES.NP),
        p: TABLES.pNP,
        h: null,
    },
    lheading: {
        o: currOrder++,
        m: blockRegex(/^([^\n]+)\n *(=|-){3,} *(?:\n *)+\n/),
        p: (capture, parse, state) => ({
            type: "heading",
            level: capture[2] === '=' ? 1 : 2,
            c: parseInline(parse, capture[1], state)
        }),
        h: null,
    },
    hr: {
        o: currOrder++,
        m: blockRegex(/^((?:[\t ]*)[-*_]){3,}(?:[\t ]*)(?:\n(?:[\t ]*))+\n/),
        p: ignoreCapture,
        h: (node, output, state) => <hr />,
    },
    codeBlock: {
        o: currOrder++,
        //match: blockRegex(/^(?:    [^\n]+\n*)+(?:\n *)+\n/),
        //match: blockRegex(/^ *(`{3,}|~{3,}) *(?:(\S+) *)?\n([^]+?)\n?\1 *(?:\n *)+\n/),

        //m: anyScopeRegex(/^[\t ]*(`{3,})[\t ]*(?:(\S+)[\t ]*)?\n([^]+?)\n?\1(?:\n+|$)/),
        m: anyScopeRegex(/^(?:[\t ]*)(`{3})(?:[\t ]*)(?:([^\s`]+?)(?:[\t ]*))?\n([^]+?)\1/),

        p: (capture, parse, state) => {
            //var c = capture[0]
            //    .replace(/^    /gm, '')
            //    .replace(/\n+$/, '');
            //return {
            //    lang: undefined,
            //    c: c
            //};

            let lang = capture[2] || undefined, c = capture[3];

            // if the language is obviously not a name, consider it as malformed code
            if(!/^[-+#a-z0-9]+$/i.test(capture[2])) {
                c = lang + '\n' + c;
                lang = undefined;
            }

            //type: "codeBlock",
            return { lang, c };
        },
        h: (node, output, state) => <CodeWrapper src={/* @once */node.c} language={/* @once */node.lang} />,
    },
    blockMath: {
        o: currOrder++,
        m: blockMathMatch,
        p: (capture, parse, state) => ({ c: capture[1] }),
        h: (node, output, state) => <Math src={/* @once */node.c} />,
    },
    blockQuote: {
        o: currOrder++,
        // NOTE: Modified from original to take up to 5 levels and require a space after >
        m: blockRegex(/^((?:[\t ]*)>{1,5} +[^\n]+(\n[^\n]+)*\n*)+\n{2,}/),
        p: (capture, parse, state) => {
            // trim first blockquote >
            var c = capture[0].replace(/^(?:[\t ]*)> ?/gm, '');
            return {
                c: parse(c, state)
            };
        },
        h: (node, output, state) => <blockquote children={/* @once */output(node.c, state)} />,
    },
    list: {
        o: currOrder++,
        m: (source, state) => {
            // We only want to break into a list if we are at the start of a
            // line. This is to avoid parsing "hi * there" with "* there"
            // becoming a part of a list.
            // You might wonder, "but that's inline, so of course it wouldn't
            // start a list?". You would be correct! Except that some of our
            // lists can be inline, because they might be inside another list,
            // in which case we can parse with inline scope, but need to allow
            // nested lists inside this inline scope.
            var prevCaptureStr =
                state.prevCapture == null ? "" : state.prevCapture[0];
            var isStartOfLineCapture = LIST_LOOKBEHIND_R.exec(prevCaptureStr);
            var isListBlock = state._list || !state.inline;

            if(isStartOfLineCapture && isListBlock) {
                source = isStartOfLineCapture[1] + source;
                return LIST_R.exec(source);
            } else {
                return null;
            }
        },
        p: (capture, parse, state) => {
            var bullet = capture[2];
            var ordered = bullet.length > 1;
            var start = ordered ? +bullet : undefined;
            // @ts-expect-error [FEI-5003] - TS2322 - Type 'RegExpMatchArray | null' is not assignable to type 'string[]'.
            var items: Array<string> = capture[0]
                .replace(LIST_BLOCK_END_R, "\n")
                .match(LIST_ITEM_R);

            // We know this will match here, because of how the regexes are
            // defined

            var lastItemWasAParagraph = false;
            var itemContent = items.map(function(item: string, i: number) {
                // We need to see how far indented this item is:
                var prefixCapture = LIST_ITEM_PREFIX_R.exec(item);
                var space = prefixCapture ? prefixCapture[0].length : 0;
                // And then we construct a regex to "unindent" the subsequent
                // lines of the items by that amount:
                var spaceRegex = new RegExp("^ {1," + space + "}", "gm");

                // Before processing the item, we need a couple things
                var content = item
                    // remove indents on trailing lines:
                    .replace(spaceRegex, "")
                    // remove the bullet:
                    .replace(LIST_ITEM_PREFIX_R, "");

                // I'm not sur4 why this is necessary again?

                // Handling "loose" lists, like:
                //
                //  * this is wrapped in a paragraph
                //
                //  * as is this
                //
                //  * as is this
                var isLastItem = i === items.length - 1;
                var containsBlocks = content.indexOf("\n\n") !== -1;

                // Any element in a list is a block if it contains multiple
                // newlines. The last element in the list can also be a block
                // if the previous item in the list was a block (this is
                // because non-last items in the list can end with \n\n, but
                // the last item can't, so we just "inherit" this property
                // from our previous element).
                var thisItemIsAParagraph =
                    containsBlocks || (isLastItem && lastItemWasAParagraph);
                lastItemWasAParagraph = thisItemIsAParagraph;

                // backup our state for restoration afterwards. We're going to
                // want to set state._list to true, and state.inline depending
                // on our list's looseness.
                var oldStateInline = state.inline;
                var oldStateList = state._list;
                state._list = true;

                // Parse inline if we're in a tight list, or block if we're in
                // a loose list.
                var adjustedContent;
                if(thisItemIsAParagraph) {
                    state.inline = false;
                    adjustedContent = content.replace(LIST_ITEM_END_R, "\n\n");
                } else {
                    state.inline = true;
                    adjustedContent = content.replace(LIST_ITEM_END_R, "");
                }

                var result = parse(adjustedContent, state);

                // Restore our state before returning
                state.inline = oldStateInline;
                state._list = oldStateList;
                return result;
            });

            return {
                ordered: ordered,
                start: start,
                items: itemContent,
            };
        },
        h: (node, output, state) => {
            let list = document.createElement(node.ordered ? 'ol' : 'ul');
            list.setAttribute('start', node.start);
            insert(list, node.items.map((item: ASTNode) => (
                <li>{/*@once*/output(item, state)}</li>
            )));
            return list;
        },
    },
    table: {
        o: currOrder++,
        m: blockRegex(TABLES.T),
        p: TABLES.pT,
        h: (node, output, state) => {
            let getStyle = (colIndex: number): JSX.CSSProperties => {
                return node.align[colIndex] == null ? {} : {
                    'text-align': node.align[colIndex]
                };
            };

            // Since the entire AST is rebuilt for every render, don't bother with <For>

            let headers = node.header.map((c: ASTNode, i: number) => (
                <th scope="col" style={/* @once */getStyle(i)}>{/* @once */output(c, state)}</th>
            ));

            let rows = node.cells.map((row: ASTNode) => (
                <tr>
                    {row.map((c: ASTNode, i: number) => <td style={/* @once */getStyle(i)}>{/* @once */output(c, state)}</td>)}
                </tr>
            ));

            return (
                <table>
                    <thead>
                        <tr>{/* @once */headers}</tr>
                    </thead>
                    <tbody>{/* @once */rows}</tbody>
                </table>
            );
        }
    },
    newline: {
        o: currOrder++,
        m: blockRegex(/^(?:\n *)*\n/),
        p: ignoreCapture,
        h: (node, output, state) => "\n",
    },
    paragraph: {
        o: currOrder++,
        m: blockRegex(/^((?:[^\n]|\n(?! *\n))+)(?:\n *)+\n/),
        p: parseCaptureInline,
        h: (node, output, state) => (
            // if last and there is extra data, append that extra data within this node
            <div class="p">{/* @once */output(node.c, state)}{state.last ? state.extra : void 0}</div>
        ),
    },
    font: {
        o: currOrder++,
        m: anyScopeRegex(/^<(arial|serif)>([^]+?)<\/\1>/),
        p: (capture, parse, state) => {
            return { f: capture[1], c: parse(capture[2], state) };
        },
        h: (node, output, state) => <span class={/* @once */"font-" + node.f}>{/* @once */output(node.c, state)}</span>,
    },
    color: {
        o: currOrder++,
        m: anyScopeRegex(/^<(r|y|o|g|c|b|p|red|yellow|orange|green|cyan|blue|purple)>([^]+?)<\/\1>/),
        p: (capture, parse, state) => {
            return { f: capture[1], c: parse(capture[2], state) };
        },
        h: (node, output, state) => <span class={/* @once */"color-" + node.f}>{/* @once */output(node.c, state)}</span>,
    },
    escape: {
        o: currOrder++,
        // We don't allow escaping numbers, letters, or spaces here so that
        // backslashes used in plain text still get rendered. But allowing
        // escaping anything else provides a very flexible escape mechanism,
        // regardless of how this grammar is extended.
        m: inlineRegex(/^\\([^0-9A-Za-z\s])/),
        p: (capture, parse, state) => {
            return {
                type: "text",
                c: capture[1]
            };
        },
        h: null
    },
    tableSeparator: {
        o: currOrder++,
        m: (source, state) => {
            if(!state.inTable) {
                return null;
            }
            return /^ *\| */.exec(source);
        },
        p: () => {
            return { type: 'tableSeparator' };
        },
        // These shouldn't be reached, but in case they are, be reasonable:
        h: () => ' | ',
    },
    // NOTE: Unlike regular markdown, Lantern's "autolink" still creates the <a> but won't trigger any embeds server-side
    autolink: {
        o: currOrder++,
        m: inlineRegex(/^<(https?:\/\/[^\s<]+[^<.,:;"')\]\s])>/),
        p: (capture, parse, state) => {
            return {
                type: "url",
                c: [{ type: "text", c: capture[1] }],
                target: capture[1]
            };
        },
        h: null
    },
    mailto: {
        o: currOrder++,
        m: inlineRegex(/^<([^@\s]{1,64}@[^@\s]+\.[^@\s]+)>/),
        //match: inlineRegex(/^<([^ >]+@[^ >]+)>/),
        p: (capture, parse, state) => {
            let address = capture[1], target = capture[1];

            // Check for a `mailto:` already existing in the link:
            if(!AUTOLINK_MAILTO_CHECK_R.test(target)) {
                target = "mailto:" + target;
            }

            return {
                type: "url", // link
                c: [{ type: "text", c: address }],
                target: target
            };
        },
        h: null
    },
    url: {
        o: currOrder++,
        m: inlineRegex(/^(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/),
        p: (capture, parse, state) => {
            return {
                // type: "link",
                c: [{ type: "text", c: capture[1] }],
                target: capture[1]
            };
        },
        h: (node, output, state) => {
            return <a onContextMenu={eat} href={/* @once */sanitizeUrl(node.target)} title={/* @once */node.title} target="_blank" rel="noreferrer">{/* @once */output(node.c, state)}</a>;
        }
    },
    math: {
        o: currOrder++,
        m: mathMatch,
        p: (capture, parse, state) => {
            return {
                c: capture[1],
            };
        },
        h: (node, output, state) => (<Math src={/* @once */node.c} inline />),
    },
    unescapedDollar: {
        o: currOrder++,
        m: inlineRegex(/^(?!\\)\$/),
        p: (capture, parse, state) => {
            return {};
        },
        h: (node, output, state) => {
            // Unescaped dollar signs render correctly, but result in
            // untranslatable text after the i18n python linter flags it
            return "$";
        },
    },
    // link: {
    //     o: currOrder++,
    //     m: inlineRegex(new RegExp(
    //         "^\\[(" + LINK_INSIDE + ")\\]\\(" + LINK_HREF_AND_TITLE + "\\)"
    //     )),
    //     p: (capture, parse, state) => {
    //         return {
    //             c: parse(capture[1], state),
    //             target: unescapeUrl(capture[2]),
    //             title: capture[3]
    //         };
    //     },
    //     h: (node, output, state) => {
    //         return <a href={/* @once */sanitizeUrl(node.target)} title={/* @once */node.title} target="_blank">{/* @once */output(node.c, state)}</a>;
    //     }
    // },
    // image: {
    //     o: currOrder++,
    //     m: inlineRegex(new RegExp(
    //         "^!\\[(" + LINK_INSIDE + ")\\]\\(" + LINK_HREF_AND_TITLE + "\\)"
    //     )),
    //     p: (capture, parse, state) => {
    //         return {
    //             alt: capture[1],
    //             target: unescapeUrl(capture[2]),
    //             title: capture[3]
    //         };
    //     },
    //     h: (node, output, state) => {
    //         return <img src={/* @once */sanitizeUrl(node.target)} alt={/* @once */node.alt} title={/* @once */node.title} />;
    //     }
    // },
    em: {
        o: currOrder /* same as strong/u */,
        m: inlineRegex(
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
        q: (capture) => {
            // precedence by length, `em` wins ties:
            return capture[0].length + 0.2;
        },
        p: (capture, parse, state) => {
            return {
                c: parse(capture[2] || capture[1], state)
            };
        },
        h: (node, output, state) => <em>{/* @once */output(node.c, state)}</em>
    },
    strong: {
        o: currOrder /* same as em */,
        m: inlineRegex(/^\*\*((?:\\[^]|[^\\])+?)\*\*(?!\*)/),
        q: (capture) => {
            // precedence by length, wins ties vs `u`:
            return capture[0].length + 0.1;
        },
        p: parseCaptureInline,
        h: (node, output, state) => <strong>{/* @once */output(node.c, state)}</strong>,
    },
    u: {
        o: currOrder++ /* same as em&strong; increment for next rule */,
        m: inlineRegex(/^__((?:\\[^]|[^\\])+?)__(?!_)/),
        q: (capture) => {
            // precedence by length, loses all ties
            return capture[0].length;
        },
        p: parseCaptureInline,
        h: (node, output, state) => <u>{/* @once */output(node.c, state)}</u>,
    },
    del: {
        o: currOrder++,
        m: inlineRegex(/^~~(?=\S)((?:\\[^]|~(?!~)|[^\s~\\]|\s(?!~~))+?)~~/),
        p: parseCaptureInline,
        h: (node, output, state) => <del>{/* @once */output(node.c, state)}</del>,
    },
    custom_emote: {
        o: currOrder++,
        m: inlineRegex(/^<:(\w*):(\d+)>/),
        p: (capture, parse, state) => {
            state.had_emoji = true;
            return { id: capture[2], name: capture[1] };
        },
        h: (node, output, state) => <CustomEmote id={/*@once*/node.id} name={/*@once*/node.name} large={/*@once*/state.no_text} />
    },
    wbr: {
        o: currOrder++,
        m: inlineRegex(/^<wbr ?\/?>/),
        p: (capture, parse, state) => ({}),
        h: (node, output, state) => <wbr />,
    },
    tags: {
        o: currOrder++,
        m: inlineRegex(/^<(sup|sub)>([^\n]+?)<\/\1>/),
        p: (capture, parse, state) => {
            let tag = capture[1], c = capture[2], tagDepth = state.tagDepth || 0;

            if(tagDepth < 2) {
                state.tagDepth = tagDepth + 1;
                let parsed = parse(c, state);
                state.tagDepth -= 1;

                return { tag, c: parsed };
            }

            return [
                {
                    type: "text",
                    c: "<" + tag + ">",
                },
                parse(c, state),
                {
                    type: "text",
                    c: "</" + tag + ">"
                }
            ];
        },
        h: (node, output, state) => {
            let el = document.createElement(node.tag);
            insert(el, output(node.c, state));
            return el;
        },
    },
    spoiler: {
        o: currOrder,
        m: anyScopeRegex(/^\|\|([^]+?)\|\|/),
        p: (capture, parse, state) => {
            return { c: parse(capture[1], state) };
        },
        h: (node, output, state) => {
            return <Spoiler>{/* @once */output(node.c, state)}</Spoiler>;
        },
    },
    inlineCode: {
        o: currOrder++,
        m: inlineRegex(/^(`+)([^]*?[^`])\1(?!`)/),
        p: (capture, parse, state) => {
            return {
                c: capture[2].replace(INLINE_CODE_ESCAPE_BACKTICKS_R, "$1")
            };
        },
        h: (node, output, state) => <code textContent={/* @once */ node.c} />,
    },
    br: {
        o: currOrder++,
        m: anyScopeRegex(/^ {2,}\n/),
        p: ignoreCapture,
        h: (node, output, state) => <br />,
    },
    emoji_alias: {
        o: currOrder++,
        m: (source, state, prev) => {
            let m = /^(:([A-Za-z0-9_\-]+)(?:::([A-Za-z_\-]+)([0-5]))?:)/.exec(source);
            return (m && (decode_emojis(), ALIASES_REV.has(m[2]))) ? m : null;
        },
        p: (capture, parse, state) => {
            state.had_emoji = true;
            return {
                c: capture[2],
                p: state.pos,
                t: (SKIN_TONE_PREFIXES.includes(capture[3]?.toLowerCase()) && capture[4] != null) ? parseInt(capture[4]) : undefined
            };
        },
        h: (node, output, state) => {
            return <Emoji named value={/* @once */node.c} tone={/* @once */node.t}
                large={/*@once*/state.no_text} />;
        }
    },
    emoji: {
        o: currOrder++,
        m: (source, state, prev) => {
            return find_emoji(source, EMOJI_RE0);
        },
        p: (capture, parse, state) => {
            state.had_emoji = true;
            return { c: capture[0], p: state.pos };
        },
        h: (node, output, state) => {
            return <Emoji value={/* @once */node.c}
                large={/*@once*/state.no_text} />;
        }
    },
    text: {
        o: currOrder++,
        // Here we look for anything followed by non-symbols,
        // double newlines, or double-space-newlines
        // We break on any symbol characters so that this grammar
        // is easy to extend without needing to modify this regex
        m: anyScopeRegex(/^[^]+?(?=[^0-9A-Za-z\s]|\n\n| {2,}\n|\w+:\S|$)/),
        p: (capture, parse, state) => {
            return { c: capture[0] };
        },
        h: (node, output, state) => node.c,
    }
};


export function outputFor(
    rules: OutputRules<'h'>,
    defaultState?: State
) {
    var latestState: State;
    var arrayRule: SolidArrayRule = (rules.Array || defaultRules.Array) as SolidArrayRule;
    var arrayRuleOutput = arrayRule.h;

    var nestedOutput: Output<any> = function(ast: ASTNode, state?: State) {
        state = state || latestState;
        latestState = state;
        if(Array.isArray(ast)) {
            return arrayRuleOutput(ast, nestedOutput, state);
        } else {
            return (rules[ast.type!] as SolidArrayRule).h(ast as any, nestedOutput, state);
        }
    };

    var outerOutput: Output<any> = function(ast: ASTNode, state?: State) {
        latestState = populateInitialState(state, defaultState);
        return nestedOutput(ast, latestState);
    };

    return outerOutput;
};

export const defaultRawParse = /*#__PURE__*/ parserFor(defaultRules);
export const defaultSolidOutput: SolidOutput = /*#__PURE__*/ outputFor(defaultRules as any);

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

export interface SolidMarkdownProps extends JSX.HTMLAttributes<HTMLDivElement> {
    source: string,
    extra?: JSX.Element,
    inline?: boolean,
}

export function SolidMarkdown(props: SolidMarkdownProps): SolidElement {
    let [local, div] = splitProps(props, ['source', 'inline', 'extra']);

    let res = () => {
        let state = { inline: !!local.inline, extra: local.extra };
        return defaultSolidOutput(defaultRawParse(local.source, state), state);
    };

    return <div {...div} children={res()} />;
};

export function clean_text(ast: SingleASTNode[]): SingleASTNode[] {
    return ast.filter(node => {
        if(node.type != 'text') {
            if(Array.isArray(node.c)) {
                node.c = clean_text(node.c as SingleASTNode[]);
            }
            return true;
        }

        return false;
    });
}

const NESTED = ['paragraph', 'spoiler', 'em', 'strong', 'u', 'del'];

function has_text_inner(node: SingleASTNode): boolean {
    if(NESTED.includes(node.type)) {
        return has_text(node.c);
    }

    switch(node.type) {
        // allow separating whitespace, will be cleaned later
        case 'text': return !/^\s*$/.test(node.c as string);

        case 'custom_emote':
        case 'emoji_alias':
        case 'emoji': return false;

        default: return true;
    }
}

export function has_text(ast: SingleASTNode[]): boolean {
    for(let node of ast) {
        if(has_text_inner(node)) {
            return true;
        }
    }
    return false;
}