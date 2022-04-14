import { Component, createMemo, createSelector, createSignal, For, lazy, onCleanup, onMount, Show, Suspense, useContext } from "solid-js";
import { useStructuredSelector } from "solid-mutant";

import { useI18nContext } from "ui/i18n/i18n-solid";
import { loadNamespaceAsync } from "ui/i18n/i18n-util.async";

import { useRootSelector } from "state/root";
import { HISTORY } from "state/global";
import { activeParty, activeRoom } from "state/selectors/active";
import { room_url } from "config/urls";

import { Link } from "ui/components/history";
import { Modal } from "ui/components/modal";
import { Ripple } from "ui/components/common/spinners/ripple";
import { VectorIcon } from "ui/components/common/icon";
import { GenericModal } from "../generic";

export function InviteModal() {
    let return_path = useRootSelector(state => room_url(activeParty(state) || '@me', activeRoom(state)));

    return (
        <GenericModal onClose={() => HISTORY.pm(return_path())}>
            Invite
        </GenericModal>
    );
}
