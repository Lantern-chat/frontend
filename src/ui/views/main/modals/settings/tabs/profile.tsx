import { createSignal, onMount, createMemo, Show, createEffect, Accessor, onCleanup, Setter } from "solid-js";

import { resize_image } from "lib/image";
import { hsv2rgb, HSVColor, pack_rgb, unpack_rgb, rgb2hsv, u82linear, linear2u8 } from "lib/color";
import { saturate } from "lib/math";

import { CLIENT } from "state/global";

import { UpdateUserProfile } from "client-sdk/src/api/commands/user";
import { useRootDispatch, useRootStore } from "state/root";
import { fetch_profile } from "state/commands/profile";
import { selectCachedUser } from "state/selectors/selectCachedUser";

import { createRef } from "ui/hooks/createRef";
import { ColorPicker } from "ui/components/common/color_picker";
import { SimpleUserCard } from "ui/views/main/components/menus/user_card";

export function ProfileSettingsTab() {
    let store = useRootStore();

    return (
        <Show when={!!store.state.user.user}>
            <ProfileSettingsTabInner />
        </Show>
    )
}

import "./profile.scss";
import { br } from "ui/utils";
import { createNumberFormatter } from "ui/hooks/createFormatter";
function createUrl(file: Accessor<File | null | undefined>): [Accessor<string | undefined | null>, Setter<string | undefined | null>] {
    let [getUrl, setUrl] = createSignal<string | undefined | null>();

    createEffect(() => {
        let f = file(), url: string | undefined;
        if(f) {
            url = URL.createObjectURL(f);
            onCleanup(() => URL.revokeObjectURL(url!))
        }

        setUrl(f === null ? null : url);
    });

    return [getUrl, setUrl];
}

function ProfileSettingsTabInner() {
    let store = useRootStore();
    onMount(() => store.dispatch(fetch_profile(store.state.user.user!.id)));
    let cached_user = createMemo(() => selectCachedUser(store.state, store.state.user.user!.id));

    let bits = () => cached_user()?.profile?.bits || 0;

    let [avatarFile, setAvatarFile] = createSignal<File | undefined | null>();
    let [bannerFile, setBannerFile] = createSignal<File | undefined | null>();

    let [localAvatarUrl, setLocalAvatarUrl] = createUrl(avatarFile);
    let [localBannerUrl, setLocalBannerUrl] = createUrl(bannerFile);

    let on_file = (e: Event, cb: Setter<File | undefined>) => cb((e.currentTarget as HTMLInputElement).files?.[0]);

    let avatar_input = createRef();
    let banner_input = createRef();

    let initial_color = () => rgb2hsv(u82linear(unpack_rgb(bits() >> 8)));
    let [color, setColor] = createSignal(initial_color());
    let [newColor, setNewColor] = createSignal<HSVColor>();

    let update_color = (color: HSVColor) => {
        setColor(color); setNewColor(color);
    };

    let reset = () => {
        setAvatarFile();
        setBannerFile();
        setNewColor();
        setColor(initial_color());
        setRoundness(bits() & 0x7F);
    };

    let can_show_remove_avatar = () => localAvatarUrl() !== null && (localAvatarUrl() || cached_user().profile?.avatar);
    let can_show_remove_banner = () => localBannerUrl() !== null && (localBannerUrl() || cached_user().profile?.banner);

    let [editingColor, setEditingColor] = createSignal(false);

    let [roundness, setRoundness] = createSignal(bits() & 0x7F);

    let num_format = createNumberFormatter({
        maximumFractionDigits: 0,
    });

    return (
        <div class="ln-settings-profile">
            <input type="file" ref={avatar_input} onChange={e => on_file(e, setAvatarFile)} accept="image/*" />
            <input type="file" ref={banner_input} onChange={e => on_file(e, setBannerFile)} accept="image/*" />

            <form>
                <div>
                    <h4 class="section-header">Color</h4>
                    <ColorPicker
                        value={color()} onChange={update_color}
                        onStartEdit={() => setEditingColor(true)}
                        onEndEdit={() => setEditingColor(false)}
                    />

                    <h4>
                        Avatar Roundness (<label for="avatar_roundness">{num_format(roundness() / 127 * 100)}%</label>)
                    </h4>

                    <div class="roundness-setting">
                        <SquircleButton which="square" onInput={() => setRoundness(r => Math.max(0, r - 1))} />

                        <div>
                            <input id="avatar_roundness" type="range" min="0" max="127" step="1"
                                list="roundness-snap"
                                value={roundness()}
                                onInput={e => setRoundness(parseInt((e.currentTarget as HTMLInputElement).value))} />

                            <datalist id="roundness-snap">
                                <option value="64" />
                            </datalist>
                        </div>

                        <SquircleButton which="circle" onInput={() => setRoundness(r => Math.min(127, r + 1))} />
                    </div>
                </div>

                <div>
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
                                style={{ 'border-radius': br(cached_user().bits.roundedness) }}>
                                Change Avatar
                            </div>
                        )}
                        profile={cached_user()!.profile}
                        presence={cached_user()!.presence}
                        avatar_url={localAvatarUrl()}
                        banner_url={localBannerUrl()} />
                </div>
            </form>

            <div class="ln-btn" onClick={reset}>Reset</div>
        </div>
    );
}

interface ISquircleButtonProps {
    which: 'square' | 'circle',
    onInput(): void;
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
        >
            {props.which == 'circle'
                ? <circle cx="4" cy="4" r="3.5" />
                : <rect x="0.5" y="0.5" width="7" height="7" />}
        </svg>
    );
}

