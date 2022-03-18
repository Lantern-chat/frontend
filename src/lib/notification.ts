export const HAS_NOTIFICATIONS: boolean = "Notification" in window && 'permissions' in navigator;

export function displayNotification(notify: () => Notification) {
    if(!HAS_NOTIFICATIONS) {
        return;
    }

    if(Notification.permission == 'granted' && !document.hasFocus()) {
        notify()
    }
}

