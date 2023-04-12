import { HAS_NOTIFICATIONS } from "lib/notification";
import { createEffect, createSignal, onMount } from "solid-js";
import { StorageKey } from "state/storage";
import { useI18nContext } from "ui/i18n/i18n-solid";
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

const HAS_QUERY = typeof navigator.permissions?.query === "function";

/*
    Behaviors:

    on load:
        If previously granted, but now denied, store that as denied
        If previously denied, but now granted, keep existing or denied

    on external change:
        If previously denied, do nothing
        If previously granted, update
*/

let stored = () => localStorage.getItem(StorageKey.NOTIFICATIONS) as NotificationPermission;

export function NotificationsSettingsTab() {
    let [perm, setPerm] = createSignal<NotificationPermission>(stored());

    let on_change: (checked: boolean) => void;

    if(HAS_NOTIFICATIONS) {
        onMount(() => {
            if(Notification.permission !== "granted") {
                setPerm(Notification.permission);
            }

            if(HAS_QUERY) {
                // only if already allowed, update value. This acts as a latch to only go to denied.
                let set = (value: NotificationPermission) => stored() === "granted" && setPerm(value);

                navigator.permissions.query({ name: "notifications" }).then(res => {
                    set(res.state as NotificationPermission);
                    // use function() to allow `this` from `res`
                    res.onchange = function() { set(this.state as NotificationPermission); };
                });
            }
        });

        on_change = (checked: boolean) => {
            // eagerly assume denied until fully granted
            setPerm("denied");

            if(checked) { requestPermission().then(res => setPerm(res)); }
        };

        // write to local storage whenever
        createEffect(() => localStorage.setItem(StorageKey.NOTIFICATIONS, perm()));
    }

    let { LL } = useI18nContext();

    let label = () => {
        let offset = HAS_NOTIFICATIONS ? (HAS_QUERY ? 0 : 1) : 2;
        return (LL().main.settings.notifications.ENABLE_DESKTOP_NOTIFICATIONS as any)[offset]();
    };

    return (
        <form class="ln-settings-form">
            <Toggle
                for="desktop_notifications"
                label={label()}
                onChange={on_change!}
                checked={perm() === "granted"}
                disabled={!HAS_NOTIFICATIONS}
            />
        </form>
    )
}