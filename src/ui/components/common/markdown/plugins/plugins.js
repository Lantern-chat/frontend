var classifyCharacter = require('micromark/dist/util/classify-character')
var chunkedSplice = require('micromark/dist/util/chunked-splice')
var resolveAll = require('micromark/dist/util/resolve-all')
var shallow = require('micromark/dist/util/shallow')

module.exports = create;

exports.enter = { spoiler: onenterspoiler };
exports.exit = { spoiler: onexitspoiler };

function onenterspoiler() {
    this.tag('<mark>');
}

function onexitspoiler() {
    this.tag('</mark>');
}

function create(options) {
    var settings = options || {};
    var single = settings.singleTilde;
    var tokenizer = {
        tokenize: tokenizeSpoiler,
        resolveAll: resolveAllSpoiler
    }

    if(single === null || single === undefined) {
        single = true
    }

    return { text: { 124: tokenizer }, insideSpan: { null: tokenizer } }

    // Take events and resolve spoiler.
    function resolveAllSpoiler(events, context) {
        var index = -1, spoiler, text, open, nextEvents;

        // Walk through all events.
        while(++index < events.length) {
            // Find a token that can close.
            if(
                events[index][0] === 'enter' &&
                events[index][1].type === 'spoilerSequenceTemporary' &&
                events[index][1]._close
            ) {
                open = index

                // Now walk back to find an opener.
                while(open--) {
                    // Find a token that can open the closer.
                    if(
                        events[open][0] === 'exit' &&
                        events[open][1].type === 'spoilerSequenceTemporary' &&
                        events[open][1]._open &&
                        // If the sizes are the same:
                        events[index][1].end.offset - events[index][1].start.offset ===
                        events[open][1].end.offset - events[open][1].start.offset
                    ) {
                        events[index][1].type = 'spoilerSequence'
                        events[open][1].type = 'spoilerSequence'

                        spoiler = {
                            type: 'spoiler',
                            start: shallow(events[open][1].start),
                            end: shallow(events[index][1].end)
                        }

                        text = {
                            type: 'spoilerText',
                            start: shallow(events[open][1].end),
                            end: shallow(events[index][1].start)
                        }

                        // Opening.
                        nextEvents = [
                            ['enter', spoiler, context],
                            ['enter', events[open][1], context],
                            ['exit', events[open][1], context],
                            ['enter', text, context]
                        ]

                        // Between.
                        chunkedSplice(
                            nextEvents,
                            nextEvents.length,
                            0,
                            resolveAll(
                                context.parser.constructs.insideSpan.null,
                                events.slice(open + 1, index),
                                context
                            )
                        )

                        // Closing.
                        chunkedSplice(nextEvents, nextEvents.length, 0, [
                            ['exit', text, context],
                            ['enter', events[index][1], context],
                            ['exit', events[index][1], context],
                            ['exit', spoiler, context]
                        ])

                        chunkedSplice(events, open - 1, index - open + 3, nextEvents)

                        index = open + nextEvents.length - 2
                        break
                    }
                }
            }
        }

        return removeRemainingSequences(events)
    }

    function removeRemainingSequences(events) {
        var index = -1
        var length = events.length

        while(++index < length) {
            if(events[index][1].type === 'spoilerSequenceTemporary') {
                events[index][1].type = 'data'
            }
        }

        return events
    }

    function tokenizeSpoiler(effects, ok, nok) {
        var previous = this.previous
        var events = this.events
        var size = 0

        return start

        function start(code) {
            if(
                code !== 124 ||
                (previous === 124 &&
                    events[events.length - 1][1].type !== 'characterEscape')
            ) {
                return nok(code)
            }

            effects.enter('spoilerSequenceTemporary')
            return more(code)
        }

        function more(code) {
            var before = classifyCharacter(previous)
            var token
            var after

            if(code === 124) {
                // If this is the third marker, exit.
                if(size > 1) return nok(code)
                effects.consume(code)
                size++
                return more
            }

            if(size < 2 && !single) return nok(code)
            token = effects.exit('spoilerSequenceTemporary')
            after = classifyCharacter(code)
            token._open = !after || (after === 2 && before)
            token._close = !before || (before === 2 && after)
            return ok(code)
        }
    }
}