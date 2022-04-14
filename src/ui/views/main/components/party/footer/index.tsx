import { createSignal, Show } from "solid-js";
import { useStructuredSelector } from "solid-mutant";

import { HISTORY } from "state/global";
import { ReadRootState } from "state/root";
import { activeParty } from "state/selectors/active";
import { selectPrefsFlag } from "state/selectors/prefs";
import { parse_presence, PresenceStatus, UserPreferenceFlags } from "state/models";

import { useI18nContext } from "ui/i18n/i18n-solid";

import { VectorIcon } from "ui/components/common/icon";
import { Link } from "ui/components/history";
import { Spinner } from "ui/components/common/spinners/spinner";
import { UserAvatar } from "ui/views/main/components/user_avatar";

import { Icons } from "lantern-icons";

import "./footer.scss";
export function PartyFooter() {
    let { LL } = useI18nContext();

    let [mute, setMute] = createSignal(false),
        [deaf, setDeaf] = createSignal(false);

    let state = useStructuredSelector({
        user: (state: ReadRootState) => state.user.user,
        is_light_theme: selectPrefsFlag(UserPreferenceFlags.LightMode),
        status: (state: ReadRootState) => {
            let active_party = activeParty(state), party, member;

            if(!active_party || active_party == '@me') return PresenceStatus.Online;

            if(party = state.party.parties[active_party]) {
                if(member = party.members[state.user.user!.id]) {
                    return parse_presence(member.presence).status;
                }
            }

            return PresenceStatus.Offline;
        }
    });

    return (
        <footer className="ln-party-footer">
            <div className="ln-party-footer__user">
                <Show when={state.user} fallback={<Spinner size="100%" />}>
                    {user => (<>
                        <UserAvatar nickname={user.username} user={user} status={state.status} is_light_theme={state.is_light_theme} />

                        <div className="ln-username">
                            <span className="ln-username__name ui-text">
                                {user.username}
                            </span>
                            <span className="ln-username__discrim ui-text">
                                #{user.discriminator.toString(16).toUpperCase().padStart(4, '0')}
                            </span>
                        </div>
                    </>)}
                </Show>
            </div>

            <div className="ln-party-footer__settings">
                <div onClick={() => setMute(v => !v)} title={mute() ? LL().main.UNMUTE() : LL().main.MUTE()}>
                    <VectorIcon id={mute() ? Icons.MicrophoneMute : Icons.Microphone} />
                </div>

                <div onClick={() => setDeaf(v => !v)} title={deaf() ? LL().main.UNDEAFEN() : LL().main.DEAFEN()}>
                    <VectorIcon id={deaf() ? Icons.SpeakerDeaf : Icons.Speaker} />
                </div>

                <Link href="/settings" title={LL().main.SETTINGS()}>
                    <VectorIcon id={Icons.Cogwheel} />
                </Link>
            </div>
        </footer>
    );
}