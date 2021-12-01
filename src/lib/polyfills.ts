
if(!String.prototype.padEnd) {
    Object.defineProperty(String.prototype, 'padEnd', {
        configurable: true,
        writable: true,
        value: function(targetLength: number, padString?: string) {
            targetLength = targetLength >> 0; //floor if number or convert non-number to 0;
            padString = String(typeof padString !== 'undefined' ? padString : ' ');
            if(this.length > targetLength) {
                return String(this);
            } else {
                targetLength = targetLength - this.length;
                if(targetLength > padString.length) {
                    padString += padString.repeat(targetLength / padString.length); //append to original to ensure we are longer than needed
                }
                return String(this) + padString.slice(0, targetLength);
            }
        },
    });
}

if(!String.prototype.padStart) {
    Object.defineProperty(String.prototype, 'padStart', {
        configurable: true,
        writable: true,
        value: function(targetLength: number, padString?: string) {
            targetLength = targetLength >> 0; //floor if number or convert non-number to 0;
            padString = String(typeof padString !== 'undefined' ? padString : ' ');
            if(this.length > targetLength) {
                return String(this);
            } else {
                targetLength = targetLength - this.length;
                if(targetLength > padString.length) {
                    padString += padString.repeat(targetLength / padString.length); //append to original to ensure we are longer than needed
                }
                return padString.slice(0, targetLength) + String(this);
            }
        },
    });
}

if(!String.prototype.trimStart) {
    Object.defineProperty(String.prototype, 'trimStart', {
        configurable: true,
        writable: true,
        value: function() {
            // TODO: Maybe manually slice the string instead of resorting to regex?
            return this.replace(/^\s+/, '');
        }
    });
}

if(!String.prototype.trimEnd) {
    Object.defineProperty(String.prototype, 'trimEnd', {
        configurable: true,
        writable: true,
        value: function() {
            return this.replace(/\s+$/, '');
        }
    });
}

if(!Array.prototype.includes) {
    Object.defineProperty(Array.prototype, 'includes', {
        configurable: true,
        writable: true,
        value: function(item: any) {
            return !!~this.indexOf(item);
        }
    });
}

Object.defineProperty(HTMLMediaElement.prototype, 'playing', {
    get: function() {
        return !!(this.currentTime > 0 && !this.paused && !this.ended && this.readyState > 2);
    }
});