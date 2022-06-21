import { createMemo, createSignal, Match, Switch } from 'solid-js'
import './profile.scss'
import { Show } from 'solid-js'
import { sendFile } from 'state/commands/sendfile'
import { SetUserAvatar } from 'client-sdk/src/api/commands'
import { CLIENT } from 'state/global'
import { pickColorFromHash } from 'lib/palette'
import { useRootSelector, useRootStore } from 'state/root'
import { themeSelector } from 'state/selectors/theme'
import { copyText } from 'lib/clipboard'
import { user_is_bot } from 'client-sdk'
import { BotLabel } from 'ui/views/main/components/misc/bot_label'
import { Markdown } from 'ui/components/common/markdown'
import { Avatar } from 'ui/components/common/avatar'
import { user_avatar_url } from 'config/urls'
import { MediaPreview } from 'ui/components/file'
import { useI18nContext } from 'ui/i18n/i18n-solid'
import { imageResizer } from 'lib/imageresizing'


export function ProfileSettingsTab() {
    // Handle file upload
    const [avatar, setAvatar] = createSignal<File | null>(null);
    const [avatar_error, setAvatarError] = createSignal('');
    const [unsaved_change, setUnsavedChange] = createSignal(false);


    const UpdateAvatar = (new_avatar:File) => {
        setUnsavedChange(true)
        setAvatar(new_avatar)
        setAvatarError('')
    }

    const applyAvatar = () => {

        imageResizer(avatar()!)
              .then((blob) => {
                    const resized_file = new File([blob], 'avatar.png', { type: 'image/png' })
                    sendFile({
                        file: {file: resized_file},
                        onError: () => console.error("Upload error"),
                        onProgress: (loaded, total) => { console.log(loaded, total)},
                    }).then((value) => {
                        CLIENT.execute(SetUserAvatar({file_id: value!}))
                        .catch(err => {
                            if(err.code === 40413) setAvatarError('File too large, please try again with a smaller file')
                            else setAvatarError("Unexpected error, please try again")
                        })
                        setUnsavedChange(false)
                    })
              });
    }

    const { LL } = useI18nContext();

    const theme = useRootSelector(themeSelector);
    const state = useRootStore().state;
    const [themeInteracive, _] = createSignal({ ...theme() });

    const discriminator = createMemo(() => state.user.user?.discriminator.toString(16).toUpperCase().padStart(4, '0'));


    return <div class='ln-user-profile'>
        <div class='ln-user-profile-edit'>
            <div class="ln-user-avatar">
                <h4 class="ui-font">AVATAR</h4>
                <label class="ln-user-avatar-input">
                    <input type="file" onChange={(e) => UpdateAvatar((e.target as HTMLInputElement).files![0])} id="input-user-avatar" />
                    Change Avatar
                </label>
                <Show when={avatar_error() !== ""}>
                    <div class="ln-user-avatar-error ui-font">{avatar_error()}</div>
                </Show>
            </div>
        </div>
        <Show when={state.user.user} fallback={<div textContent={LL().LOADING()} />}>
            <div class="ln-user-profile-preview">
                <div class="ln-user-card ln-contextmenu">
                    <div class="ln-user-card__header">
                        <div class="banner"
                            style={{ "background-color": pickColorFromHash(state.user.user?.id ?? '', themeInteracive().is_light) }}
                        />
                        <div class="ln-user-avatar">
                            <label for="input-user-avatar">
                                <Switch fallback={
                                    <Avatar username={state.user.user?.username}></Avatar>
                                }>
                                    <Match when={avatar()}>
                                        <MediaPreview file={avatar()!} />
                                    </Match>
                                    <Match when={state.user.user?.avatar}>
                                        <Avatar url={user_avatar_url(state.user.user!.id, state.user.user?.avatar)} />
                                    </Match>
                                </Switch>
                            </label>
                        </div>
                    </div>

                    <div class="ln-user-card__info">
                        <div class="ui-text ln-username" onClick={() => copyText(state.user.user?.username + '#' + discriminator())}>
                            <h4>{state.user.user?.username}<span class="ln-username__discriminator">#{discriminator()}</span></h4>
                            <Show when={user_is_bot(state.user.user)}>
                                <BotLabel />
                            </Show>
                        </div>

                        <Show when={state.user.user?.status}>
                            {status => <div class="ln-user-custom-status" textContent={status} />}
                        </Show>

                        <Show when={state.user.user?.bio}>
                            <hr />
                            <div class="ln-user-biography">
                                <span class="ln-user-biography__title">ABOUT ME</span>
                                <Markdown source={state.user.user?.bio!} />
                            </div>
                        </Show>
                    </div>
                </div>
            </div>
        </Show>
        <Show when={unsaved_change()}>
            <div class="ln-profile-unsaved-notice">
                <span>You have unsaved changes</span>
                <button onClick={applyAvatar}>Save</button>
            </div>
        </Show>
    </div>
}
