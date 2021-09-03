import React, { useState } from "react";
import { useSelector } from "react-redux";
import { createSelector, createStructuredSelector } from "reselect";

import { RootState } from "state/root";
import { activeParty } from "state/selectors/active";
import { parse_presence } from "state/models";

import { UserAvatar } from "../user_avatar";
import { Glyphicon } from "ui/components/common/glyphicon";
import { Link } from "ui/components/history";
import { Spinner } from "ui/components/common/spinners/spinner";

import Cogwheel from "icons/glyphicons-pro/glyphicons-basic-2-4/svg/individual-svg/glyphicons-basic-137-cogwheel.svg";
import Speaker from "icons/glyphicons-pro/glyphicons-basic-2-4/svg/individual-svg/glyphicons-basic-186-volume-up.svg";
import SpeakerDeaf from "icons/glyphicons-pro/glyphicons-basic-2-4/svg/individual-svg/glyphicons-basic-184-volume-off.svg";
import Microphone from "icons/glyphicons-pro/glyphicons-basic-2-4/svg/individual-svg/glyphicons-basic-341-mic.svg";
import MicrophoneMute from "icons/glyphicons-pro/glyphicons-basic-2-4/svg/individual-svg/glyphicons-basic-342-mic-off.svg";

let status_selector = createSelector(
    (state: RootState) => state.user.user!,
    (state: RootState) => state.party.parties,
    activeParty,
    (user, parties, active_party) => {
        if(!active_party || active_party == '@me') return 'online';
        let party = parties.get(active_party);
        if(!party) return 'offline';
        let member = party.members.get(user.id);
        if(!member) return 'offline';

        return parse_presence(member.presence).status;
    }
)

let footer_selector = createStructuredSelector({
    user: (state: RootState) => state.user.user,
    is_light_theme: (state: RootState) => state.theme.is_light,
    status: status_selector,
});

import "./party_footer.scss";
export const PartyFooter = React.memo(() => {
    let { user, is_light_theme, status } = useSelector(footer_selector);

    let [mute, setMute] = useState(false);
    let [deaf, setDeaf] = useState(false);

    let user_info;
    if(user) {
        user_info = (
            <>
                <UserAvatar nickname={user.username} user={user} status={status} is_light_theme={is_light_theme} />

                <div className="ln-username">
                    <span className="ln-username__name">
                        {user.username}
                    </span>
                    <span className="ln-username__discrim">
                        #{user.discriminator.toString(16).toUpperCase().padStart(4, '0')}
                    </span>
                </div>
            </>
        );
    } else {
        user_info = (
            <Spinner size="100%" />
        );
    }

    return (
        <footer className="ln-party-footer">
            <div className="ln-party-footer__user">
                {user_info}
            </div>

            <div className="ln-party-footer__settings">
                <div onClick={() => setMute(!mute)} title={mute ? 'Unmute' : 'Mute'}>
                    <Glyphicon src={mute ? MicrophoneMute : Microphone} />
                </div>
                <div onClick={() => setDeaf(!deaf)} title={deaf ? 'Undeafen' : 'Deafen'}>
                    <Glyphicon src={deaf ? SpeakerDeaf : Speaker} />
                </div>
                <Link href="/settings/profile" title="Settings">
                    <Glyphicon src={Cogwheel} />
                </Link>
            </div>
        </footer>
    );
})