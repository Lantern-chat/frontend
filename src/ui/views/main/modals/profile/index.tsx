import React from "react";
import { Modal } from "ui/components/modal";

import { Settings } from "./settings";

import "../modal.scss";
import "./profile.scss";
export const ProfileModal = React.memo(() => {
    return (
        <Modal>
            <div className="ln-modal ln-profile">
                <div className="ln-profile__wrapper">
                    <Settings />
                </div>
            </div>
        </Modal>
    )
});