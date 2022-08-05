import { createMemo, createSignal, Show } from "solid-js";
import { useStructuredSelector } from "solid-mutant";

import { HISTORY } from "state/global";
import { RootState, useRootSelector } from "state/root";
import { activeParty } from "state/selectors/active";
import { parse_presence, PresenceStatus } from "state/models";

import { useI18nContext } from "ui/i18n/i18n-solid";

import { VectorIcon } from "ui/components/common/icon";
import { Link } from "ui/components/history";
import { Spinner } from "ui/components/common/spinners/spinner";
import { UserAvatar } from "ui/views/main/components/user_avatar";

import { Icons } from "lantern-icons";

import "./footer.scss";
import { copyText } from "lib/clipboard";
import { selectCachedUser } from "state/selectors/selectCachedUser";
export function PartyFooter() {
    let { LL } = useI18nContext();

    let [mute, setMute] = createSignal(false),
        [deaf, setDeaf] = createSignal(false);

    let cached_user = useRootSelector(state => state.user.user && selectCachedUser(state, state.user.user!.id, activeParty(state)));

    return (
        <footer class="ln-party-footer">
            <div class="ln-party-footer__user">
                <Show when={cached_user()} fallback={<Spinner size="100%" />}>
                    {user => {
                        let user_discriminator = createMemo(() => user.user.discriminator.toString(16).toUpperCase().padStart(4, '0'))
                        return (<>
                            <UserAvatar nickname={user.user.username} user_id={user.user.id} profile={user.profile} presence={user.presence} />

                            <div class="ln-username" onClick={() => copyText(user.user.username + '#' + user_discriminator())}>
                                <span class="ln-username__name ui-text">
                                    {user.user.username}
                                </span>
                                <span class="ln-username__discrim ui-text">
                                    #{user_discriminator()}
                                </span>
                            </div>
                        </>)
                    }}
                </Show>
            </div>

            <div class="ln-party-footer__settings">
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