

export const SUPPORTS_PASSIVE: boolean = (() => {
    var supportsPassive = false, w = window as any;
    try {
        var opts = Object.defineProperty({}, 'passive', {
            get: function() {
                supportsPassive = true;
            }
        });
        w.addEventListener("testPassive", null, opts);
        w.removeEventListener("testPassive", null, opts);
    } catch(e) { }

    return supportsPassive;
})();