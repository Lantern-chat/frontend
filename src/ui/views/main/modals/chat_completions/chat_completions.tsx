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
    cursorPosition: Accessor<number>;
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
    const [messageLength, setMessageLength] = createSignal(props.typingMessageValue().length);

    createEffect(() => {
        const atIndex = props.typingMessageValue().indexOf("@");
        if (atIndex === -1) {
            setSuggestions([]);
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
            setSuggestions(suggestions.map(member => {
                return {
                    suggestion: member.nick || member.user.username,
                    info: member.user.username
                }
            }))
        }
    })

    return(
        <Show when={suggestions().length > 0}>
            <div class="ln-suggestions">
                {suggestions().map(suggestion => {
                    return (
                        <div class="ln-suggestion">
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