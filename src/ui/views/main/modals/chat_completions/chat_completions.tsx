import { Accessor, createEffect, createMemo, createSignal, Show } from "solid-js";
import { selectPrefsFlag } from "state/selectors/prefs";
import { ReadRootState, Type, useRootDispatch, useRootSelector } from "state/root";
import {  UserPreferenceFlags } from "state/models";
import { useStructuredSelector } from "solid-mutant";
import { activeParty, activeRoom } from "state/selectors/active";
import { user_avatar_url } from "config/urls";
import { pickColorFromHash } from "lib/palette";
import'./chat_completion.scss'
const MAX_SUGGESTION_NUMBER = 10;
interface IChatCompletions{
    typingMessageValue: Accessor<string>;
    typeMessage: (message: string) => void;
    cursorPosition: Accessor<number>;
    showSuggestions: (show: boolean) => void;
}

interface ISuggestion{
    suggestion: string;
    info: string;
}
const ChatCompletetions = (props: IChatCompletions) => {
    let state = useStructuredSelector({
        use_mobile_view: (state: ReadRootState) => state.window.use_mobile_view,
        is_light_theme: selectPrefsFlag(UserPreferenceFlags.LightMode),
        party: (state: ReadRootState) => {
            let party_id = activeParty(state);
            if(party_id) {
                return state.party.parties[party_id];
            }
            return;
        },
    });
    
    const [suggestions, setSuggestions] = createSignal<ISuggestion[]>([]);
    const [hoveringSuggestion, setHoveringSuggestion] = createSignal<number>(0);
    const [showingSuggestionStartingIndex, setShowingSuggestionStartingIndex] = createSignal<number>(0);
    const [showingSuggestionEndingIndex, setShowingSuggestionEndingIndex] = createSignal<number>(10);
    const [messageLength, setMessageLength] = createSignal(props.typingMessageValue().length);

    createEffect(() => {
        const atIndex = props.typingMessageValue().lastIndexOf("@");
        if (atIndex === -1) {
            return;
        }
        const suffix = props.typingMessageValue().slice(atIndex + 1);
        let members = state.party?.members
        if(members){
            const suggestions = Object.values(members).filter(member => {
                let nick_filter = member.nick?.toLowerCase().indexOf(suffix.toLowerCase());
                let username_filter = member.user.username?.toLowerCase().indexOf(suffix.toLowerCase());
                return (nick_filter !== undefined && nick_filter !== -1) || username_filter !== undefined && username_filter !== -1
            })
            props.showSuggestions(true);
            setSuggestions(suggestions.map(member => {
                return {
                    suggestion: member.nick || member.user.username,
                    info: member.user.username
                }
            }))
        }
    })
    createEffect(() => {
        const hastagIndex = props.typingMessageValue().lastIndexOf("#");
        if (hastagIndex === -1) {
            return;
        }
        const suffix = props.typingMessageValue().slice(hastagIndex + 1);
        let room_names = state.party?.rooms.map(room => room.name);
        if(room_names){
            const suggestions = room_names.filter(room_name => {
                let room_name_filter = room_name.toLowerCase().indexOf(suffix.toLowerCase());
                return room_name_filter !== undefined && room_name_filter !== -1
            })
            props.showSuggestions(true);
            setSuggestions(suggestions.map(room_name => {
                return {
                    suggestion: room_name,
                    info: room_name
                }
            }))
        }
    })

    createEffect(() => {
        const hastagIndex = props.typingMessageValue().lastIndexOf("#");
        const atIndex = props.typingMessageValue().lastIndexOf("@");
        if (hastagIndex === -1 && atIndex === -1) setSuggestions([]);
    })
    const applySuggestion = (suggestion: string) => {
        console.log(suggestion)
        const atIndex = props.typingMessageValue().lastIndexOf("@");
        const hastagIndex = props.typingMessageValue().lastIndexOf("#");
        const symbol = atIndex > hastagIndex ? "@" : "#";
        if (atIndex === -1 && hastagIndex === -1) {
            return;
        }
        const prefix = props.typingMessageValue().slice(0, atIndex !== -1 ? atIndex : hastagIndex);
        props.typeMessage(`${prefix}${symbol}${suggestion} `);
        setSuggestions([]);
        props.showSuggestions(false);
    }

    const selectNextSuggestion = () => {
        if (suggestions().length === 0) {
            return;
        }
        let nextSuggestion = hoveringSuggestion() + 1;
        if (nextSuggestion >= suggestions().length) {
            nextSuggestion = 0;
        }
        setHoveringSuggestion(nextSuggestion);
        setShowingSuggestionStartingIndex(Math.floor(nextSuggestion / MAX_SUGGESTION_NUMBER) * 10);
        setShowingSuggestionEndingIndex((Math.floor(nextSuggestion / MAX_SUGGESTION_NUMBER) + 1) * 10);
    }

    const selectPreviousSuggestion = () => {
        if (suggestions().length === 0) {
            return;
        }
        let previousSuggestion = hoveringSuggestion() - 1;
        if (previousSuggestion < 0) {
            previousSuggestion = suggestions().length - 1;
        }
        setHoveringSuggestion(previousSuggestion);
        setShowingSuggestionStartingIndex(Math.floor(previousSuggestion / MAX_SUGGESTION_NUMBER) * 10);
        setShowingSuggestionEndingIndex((Math.floor(previousSuggestion / MAX_SUGGESTION_NUMBER) + 1) * 10);
    }

    createEffect(() => console.log(suggestions()))

    document.addEventListener("keyup", (e) => {
        switch(e.key){
            case 'ArrowDown':
                selectNextSuggestion();
                break;
            case 'ArrowUp':
                selectPreviousSuggestion()
                break;
            case 'Enter':
                applySuggestion(suggestions()[hoveringSuggestion()].suggestion);
                break;
        }
    })

    return(
        <Show when={suggestions().length > 0}>
            <div class="ln-suggestions">
                {suggestions().slice(showingSuggestionStartingIndex(), showingSuggestionEndingIndex()).map((suggestion, index) => {
                    return (
                        <div class={"ln-suggestion" + (hoveringSuggestion() === index + showingSuggestionStartingIndex() ? " ln-suggestion-hovering":"")} onClick={() => applySuggestion(suggestion.suggestion)}>
                            <span class="ln-suggestion__suggestion">{suggestion.suggestion}</span>
                            <span class="ln-suggestion__info">{suggestion.info}</span>
                        </div>
                    )
                })}
            </div>
        </Show>
    )
}
export default ChatCompletetions