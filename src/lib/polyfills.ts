Object.defineProperty(HTMLMediaElement.prototype, "playing", {
    get: function() {
        return !!(this.currentTime > 0 && !this.paused && !this.ended && this.readyState > 2);
    }
});