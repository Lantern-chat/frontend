import { createSignal, Show } from "solid-js";

import { useRootSelector } from "state/root";
import { activeParty } from "state/selectors/active";
import { selectCachedUser } from "state/selectors/selectCachedUser";

import { useI18nContext } from "ui/i18n/i18n-solid";

import { VectorIcon } from "ui/components/common/icon";
import { Link } from "ui/components/history";
import { Spinner } from "ui/components/common/spinners/spinner";
import { UserAvatar } from "ui/views/main/components/user_avatar";
import { Discriminator } from "../../misc/discriminator";

import { Icons } from "lantern-icons";

import "./footer.scss";
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
                        return (<>
                            <UserAvatar nickname={user.user.username} user_id={user.user.id} profile={user.profile} presence={user.presence} />

                            <div class="ln-username ui-text">
                                <span class="ln-username__name">{user.user.username}</span>
                                <Discriminator discriminator={user.user.discriminator} />
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