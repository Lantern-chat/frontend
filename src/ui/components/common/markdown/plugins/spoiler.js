export default function attacher(options) {
    options = options ?? {}; // Prevents options from being null
    const Parser = this.Parser.prototype;

    const nodeType = options.nodeType ?? 'spoiler';
    const marker = options.marker ?? '||';
    const classNames = options.classNames ?? [];
    const tagType = options.tagType ?? 'mark';

    Parser.inlineTokenizers.spoiler = function spoilerTokenizer(eat, value, silent) {
        if(value.startsWith(marker)) {
            const end = value.indexOf(marker, 2);

            if(end > -1) {
                if(silent) {
                    return true;
                }

                const text = value.substring(2, end);

                const now = eat.now();
                now.column += marker.length;
                now.offset += marker.length;

                return eat(marker + text + marker)({
                    type: nodeType,
                    children: this.tokenizeInline(text, now),
                    data: {
                        hName: tagType,
                        hProperties: classNames.length ? { className: classNames } : {}
                    }
                });
            }
        }

        return false;
    };
    Parser.inlineTokenizers.spoiler.locator = (value, fromIndex) => value.indexOf(marker, fromIndex);
    Parser.inlineMethods.splice(Parser.inlineMethods.indexOf('strong'), 0, 'spoiler');
};