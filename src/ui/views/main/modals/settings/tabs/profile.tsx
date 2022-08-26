import { createSignal, onMount, createMemo, Show, createEffect, Accessor, onCleanup, Setter, JSX, on } from "solid-js";

import { resize_image } from "lib/image";
import { unpack_rgb, u82float, RGBColor, pack_rgb, float2u8 } from "lib/color";
import { createPercentFormatter } from "ui/hooks/createFormatter";
import { br } from "ui/utils";
import { createFileUrl } from "ui/hooks/createFileUrl";

import { CLIENT } from "state/global";

import { UpdateUserProfile } from "client-sdk/src/api/commands/user";
import { useRootStore } from "state/root";
import { fetch_profile } from "state/commands/profile";
import { sendBlob } from "state/commands/sendfile";
import { selectCachedUser } from "state/selectors/selectCachedUser";

import { useOnNav } from "ui/hooks/useMain";
import { createRef } from "ui/hooks/createRef";
import { createOnPredicate } from "ui/hooks/createOnChange";
import { FullscreenModal } from "ui/components/modal";
import { UIText } from "ui/components/common/ui-text";
import { ColorPicker } from "ui/components/common/color_picker";
import { SimpleUserCard } from "ui/views/main/components/menus/user_card";
import { Spinner } from "ui/components/common/spinners/spinner";
import { TextareaAutosize } from "ui/components/input/textarea";

import "./profile.scss";
export function ProfileSettingsTab() {
    let store = useRootStore();

    return (
        <Show when={!!store.state.user.user}>
            <ProfileSettingsTabInner />
        </Show>
    )
}

function compare_color(x: RGBColor, y: RGBColor): boolean {
    return x.r == y.r && x.g == y.g && x.b == y.b;
}

let on_file = (e: Event, cb: Setter<File | undefined>) => cb((e.currentTarget as HTMLInputElement).files?.[0]);

function ProfileSettingsTabInner() {
    let store = useRootStore();
    onMount(() => store.dispatch(fetch_profile(store.state.user.user!.id)));
    let cached_user = createMemo(() => selectCachedUser(store.state, store.state.user.user!.id));

    let bits = createMemo(() => cached_user()?.profile?.bits || 0);

    let initial_color = createMemo(() => u82float(unpack_rgb(bits() >> 8)));
    let initial_roundness = () => bits() & 0x7F;
    let initial_status = () => cached_user().profile?.status || '';
    let initial_bio = () => cached_user().profile?.bio || '';

    let [color, setColor] = createSignal(initial_color());
    let [roundness, setRoundness] = createSignal(initial_roundness());
    let [status, setStatus] = createSignal(initial_status());
    let [bio, setBio] = createSignal(initial_bio());


    let [localAvatarUrl, avatarFile, setAvatarFile] = createFileUrl();
    let [localBannerUrl, bannerFile, setBannerFile] = createFileUrl();

    let avatar_input = createRef();
    let banner_input = createRef();

    let can_show_remove_avatar = () => localAvatarUrl() !== null && (localAvatarUrl() || cached_user().profile?.avatar);
    let can_show_remove_banner = () => localBannerUrl() !== null && (localBannerUrl() || cached_user().profile?.banner);

    let [editingColor, setEditingColor] = createSignal(false);

    let percent = createPercentFormatter(0);

    let [hasChanges, setHasChanges] = createSignal(false);

    let [saving, setSaving] = createSignal(false);
    let [pendingAction, setPendingAction] = createSignal(false);

    let wait_for_not_pending = createOnPredicate(pendingAction, v => !v);
    let wait_for_not_saving = createOnPredicate(saving, v => !v);
    let canceled_nav = false;

    useOnNav(async (url) => {
        // may as well just avoid extra navigation...
        if(url == '/settings/profile') {
            return false;
        }

        if(hasChanges()) {
            if(saving()) {
                await wait_for_not_saving();
            } else {
                setPendingAction(true);

                await wait_for_not_pending();
            }
        }

        if(canceled_nav) {
            // reset `canceled_nav` and return false in one swoop.
            return canceled_nav = false;
        }

        return true;
    });

    let reset = () => {
        setAvatarFile(undefined);
        setBannerFile(undefined);
        setColor(initial_color());
        setRoundness(initial_roundness());
        setStatus(initial_status());
        setBio(initial_bio());
        setPendingAction(false);
    };

    let reset_if_changed = () => { if(hasChanges() && !saving()) reset() };

    createEffect(() => {
        // acquire all these first to make this effect dependent on them
        let af = avatarFile(),
            bf = bannerFile(),
            r = roundness(),
            c = color(),
            s = status(),
            b = bio();

        // actually check for changes
        setHasChanges(af !== undefined || bf !== undefined
            || r != initial_roundness()
            || !compare_color(c, initial_color())
            || s != initial_status()
            || b != initial_bio());
    });

    // whenever the actual user object changes, reset all the values
    createEffect(on(() => {
        let p = cached_user().profile;
        if(p) { p.avatar; p.banner; p.bits; p.bio; p.status; }
    }, reset));

    // TODO: If a navigation is attempted, make sure to cancel that if an error occurs
    let save = async () => {
        if(!hasChanges() || saving()) return;

        setSaving(true);

        try {
            let limits = window.config.limits;

            // ensure null values are passed through
            let [resized_avatar, resized_banner] = await Promise.all([
                localAvatarUrl() != null ? resize_image(localAvatarUrl()!, limits.avatar_width, limits.avatar_width) : (localAvatarUrl() as null | undefined),
                localBannerUrl() != null ? resize_image(localBannerUrl()!, limits.banner_width, limits.banner_height) : (localBannerUrl() as null | undefined),
            ]);

            let [avatar, banner] = await Promise.all([
                resized_avatar ? sendBlob(avatarFile()!.name, resized_avatar) : resized_avatar,
                resized_banner ? sendBlob(bannerFile()!.name, resized_banner) : resized_banner,
            ]);

            let new_bits = bits() | 0x80;

            // combine new roundness value
            new_bits = (new_bits & ~0x7F) | (roundness() & 0x7F);

            // combine new color
            new_bits = (new_bits & 0xFF) | (pack_rgb(float2u8(color())) << 8);

            // only set if the bio/status changed, and a zero-length value indicates removal, so null.

            let new_bio, new_status, profile = cached_user().profile;

            if(bio() != profile?.bio) { new_bio = bio(); }
            if(status() != profile?.status) { new_status = status(); }

            if(typeof new_bio === 'string' && new_bio.length == 0) {
                new_bio = null;
            }
            if(typeof new_status === 'string' && new_status.length == 0) {
                new_status = null;
            }

            if(new_bits == bits() && avatar === undefined && banner === undefined && new_bio === undefined && new_status === undefined) {
                reset(); // no actual changes?
                return;
            }

            await CLIENT.execute(UpdateUserProfile({
                profile: {
                    bits: new_bits,
                    avatar,
                    banner,
                    bio: new_bio,
                    status: new_status,
                }
            }));

            setAvatarFile();
            setBannerFile();

            store.dispatch(fetch_profile(store.state.user.user!.id));

            // TODO: Catch errors
        } finally {
            setSaving(false);
            setPendingAction(false);
        }
    };

    return (
        <div class="ln-settings-profile">
            <input type="file" ref={avatar_input} onChange={e => on_file(e, setAvatarFile)} accept="image/*" />
            <input type="file" ref={banner_input} onChange={e => on_file(e, setBannerFile)} accept="image/*" />

            <Show when={pendingAction()}>
                <FullscreenModal blur>
                    <div class="ln-settings-profile__confirm">
                        <div>
                            <UIText text="You have unsaved changes to your profile!" />

                            <div class="profile-submit">
                                <div class="ln-btn" onClick={save} classList={{ 'disabled': !hasChanges() }}>
                                    <Show fallback="Save" when={saving()}>
                                        <Spinner size="2em" />
                                    </Show>
                                </div>

                                <div class="ln-btn" onClick={() => { canceled_nav = true; setPendingAction(false); }}>Stay on Page</div>

                                <div class="ln-btn" onClick={reset_if_changed} classList={{ 'disabled': !hasChanges() || saving() }}>Discard</div>
                            </div>
                        </div>
                    </div>
                </FullscreenModal>
            </Show>

            <form>
                <div class="ln-settings-profile__inner">
                    <ColorPicker
                        value={color()} onChange={setColor}
                        onStartEdit={() => setEditingColor(true)}
                        onEndEdit={() => setEditingColor(false)}
                    />

                    <hr />

                    <h4>
                        Avatar Roundness (<label for="avatar_roundness" textContent={percent(roundness() / 127)} />)
                    </h4>
                    <div class="roundness-setting">
                        <div style={{
                            '--avatar-roundness-raw': roundness() / 127,
                            '--avatar-roundness': br(roundness() / 127),
                            '--avatar-roundness-formatted': '"' + percent(roundness() / 127) + '"'
                        }}>
                            <input id="avatar_roundness" type="range" min="0" max="127" step="1"
                                list="roundness-snap"
                                value={roundness()}
                                onInput={e => setRoundness(parseInt((e.currentTarget as HTMLInputElement).value))} />

                            <datalist id="roundness-snap">
                                <option value="64" />
                            </datalist>
                        </div>

                        <SquircleButton style={{ left: 0 }} which="square" onInput={() => setRoundness(r => Math.max(0, r - 1))} />
                        <SquircleButton style={{ right: 0 }} which="circle" onInput={() => setRoundness(r => Math.min(127, r + 1))} />
                    </div>

                    <h4>Status</h4>
                    <TextInput class="chat-text status-input" maxRows={2} value={status()} onChange={setStatus} denyNewlines />

                    <h4>Biography</h4>
                    <TextInput class="ui-text bio-input" maxRows={8} minRows={4} value={bio()} onChange={setBio} />

                    <div class="profile-submit">
                        <div class="ln-btn" onClick={save} classList={{ 'disabled': !hasChanges() }}>
                            <Show fallback="Save" when={saving()}>
                                <Spinner size="2em" />
                            </Show>
                        </div>
                        <div class="ln-btn" onClick={reset_if_changed} classList={{ 'disabled': !hasChanges() || saving() }}>Reset</div>
                    </div>
                </div>

                <div class="ln-settings-profile__user-card">
                    <SimpleUserCard
                        user={cached_user()!.user}
                        nick={cached_user()!.nick}
                        bits={cached_user()!.bits}
                        color={color()}
                        hideBanner={editingColor()}
                        roundness={roundness() / 127}
                        bannerCover={(
                            <>
                                <div class="banner-cover"
                                    onClick={e => banner_input.current?.click()}
                                >
                                    Change Banner
                                </div>
                                <div class="remove-buttons ui-text">
                                    <Show when={can_show_remove_avatar()}>
                                        <div onClick={() => setAvatarFile(null)}>Remove Avatar</div>
                                    </Show>
                                    <Show when={can_show_remove_banner()}>
                                        <div onClick={() => setBannerFile(null)}>Remove Banner</div>
                                    </Show>
                                </div>
                            </>
                        )}
                        avatarCover={(
                            <div class="avatar-cover"
                                onClick={e => avatar_input.current?.click()}
                                style={{ 'border-radius': br(roundness() / 127) }}>
                                Change Avatar
                            </div>
                        )}
                        profile={Object.assign({}, cached_user()!.profile, { bio: bio(), status: status() })}
                        presence={cached_user()!.presence}
                        avatar_url={localAvatarUrl()}
                        banner_url={localBannerUrl()} />
                </div>
            </form>
        </div>
    );
}

interface ITextInputProps {
    value: string;
    onChange(value: string): void;
    class: string,
    maxRows?: number;
    minRows?: number,
    denyNewlines?: boolean;
}

function TextInput(props: ITextInputProps) {
    let onInput = (e: InputEvent) => {
        let ta = e.currentTarget as HTMLTextAreaElement;
        if(props.denyNewlines) {
            ta.value = ta.value.replace(/\n/g, '');
        }
        props.onChange(ta.value);
    };

    let stop = (e: KeyboardEvent) => {
        e.stopPropagation();
    };

    return (
        <div class={"profile-textarea " + props.class} onKeyDown={stop} onKeyUp={stop}>
            <TextareaAutosize maxRows={props.maxRows} minRows={props.minRows} value={props.value} onInput={onInput} />
        </div>
    )
}

interface ISquircleButtonProps {
    which: 'square' | 'circle',
    onInput(): void;
    style: JSX.CSSProperties,
}

function SquircleButton(props: ISquircleButtonProps) {
    let [holding, setHolding] = createSignal(false);

    let timer: number;

    let update = () => {
        if(holding()) {
            props.onInput();
            timer = setTimeout(update, 50);
        }
    };

    let start = () => {
        setHolding(true);
        props.onInput();
        timer = setTimeout(update, 500);
    };

    let mousedown = (e: MouseEvent) => {
        if(e.buttons & 1) { start(); }
    };

    let touchstart = (e: TouchEvent) => { e.preventDefault(); start(); };
    let touchend = (e: TouchEvent) => { e.preventDefault(); cancel(); };

    let cancel = () => { setHolding(false); clearTimeout(timer); };

    return (
        <svg class="squircle" viewBox="0 0 8 8"
            onMouseDown={mousedown}
            onMouseUp={cancel}
            onMouseLeave={cancel}
            onTouchStart={touchstart}
            onTouchEnd={touchend}
            style={props.style}
        >
            {props.which == 'circle'
                ? <circle cx="4.25" cy="3.75" r="4" />
                : <rect x="0" y="0" width="7.5" height="7.5" />}
        </svg>
    );
}
