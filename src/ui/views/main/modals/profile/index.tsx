import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createStructuredSelector, createSelector } from "reselect";

import { RootState } from "state/root";
import { HISTORY } from "state/global";

import { Modal } from "ui/components/modal";

import { Settings } from "./settings";

let return_path_selector = createSelector(
    (state: RootState) => state.chat.active_party,
    (state: RootState) => state.chat.active_room,
    (active_party, active_room) => {
        let path = '/channels/' + (active_party || '@me');
        if(active_room) {
            path += '/' + active_room;
        }
        return path;
    }
);

import "../modal.scss";
import "./profile.scss";
export const ProfileModal = React.memo(() => {
    let [closing, setClosing] = useState(false);

    let return_path = useSelector(return_path_selector);

    useEffect(() => {
        let listener = (e: KeyboardEvent) => {
            if(e.key == 'Escape' && !closing) {
                setClosing(true);
                setTimeout(() => HISTORY.push(return_path), 200);
            }
        }
        window.addEventListener('keyup', listener);
        return () => window.removeEventListener('keyup', listener);
    }, []);

    let className = "ln-modal ln-profile";
    if(closing) {
        className += ' ln-profile--closing';
    } else {
        className += ' ln-profile--opened';
    }

    return (
        <Modal>
            <div className={className}>
                <div className="ln-profile__wrapper">
                    <Settings />
                </div>
            </div>
        </Modal>
    )
});