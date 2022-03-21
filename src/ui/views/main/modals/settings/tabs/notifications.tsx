import { HAS_NOTIFICATIONS } from "lib/notification";
import { createEffect, createMemo, createSignal, onMount } from "solid-js";
import { StorageKey } from "state/storage";
import { Toggle } from "../components/toggle";

export var REQ_PERM_PROMISE: undefined | Promise<NotificationPermission>;

export function requestPermission() {
    if(!REQ_PERM_PROMISE) {
        REQ_PERM_PROMISE = Notification.requestPermission().then(res => {
            REQ_PERM_PROMISE = undefined;
            return res;
        });
    }
    return REQ_PERM_PROMISE;
}

const HAS_QUERY = 'permissions' in navigator && typeof navigator.permissions.query === 'function';

export function NotificationsSettingsTab() {
    let [perm, setPerm] = createSignal<NotificationPermission>('default');

    let on_change = (checked: boolean) => {
        if(!HAS_NOTIFICATIONS) return;

        // eagerly assume disabled until fully granted
        setPerm('default');

        if(checked) { requestPermission().then(res => setPerm(res)); }
    };

    // write to local storage whenever
    createEffect(() => localStorage.setItem(StorageKey.NOTIFICATIONS, perm()));

    onMount(() => {
        if(!HAS_NOTIFICATIONS) return;

        let perm = Notification.permission;
        if(Notification.permission == 'granted') {
            setPerm(localStorage.getItem(StorageKey.NOTIFICATIONS) as NotificationPermission || 'default');
        } else {
            setPerm(perm);
        }

        if(HAS_QUERY) navigator.permissions.query({ name: 'notifications' }).then(res => {
            setPerm(res.state as NotificationPermission);
            // use function() to allow `this` from `res`
            res.onchange = function() { setPerm(this.state as NotificationPermission); };
        });
    });

    let label = createMemo(() => {
        let label = "Enable Desktop Notifications";
        if(HAS_NOTIFICATIONS && HAS_QUERY) {
            return label;
        }

        return (
            <>
                {label} <br />
                {HAS_NOTIFICATIONS ? "(May be outdated if revoked externally)" : "(Not Available)"}
            </>
        );
    })

    return (
        <form className="ln-settings-form">
            <Toggle
                htmlFor="desktop_notifications"
                label={label()}
                onChange={on_change}
                checked={perm() === 'granted'}
                disabled={!HAS_NOTIFICATIONS}
            />
        </form>
    )
}