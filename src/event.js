/**
 * 模仿nodejs的事件处理机制
 * 用法见NodeJS中的events.EventEmitter的用法
 * @constructor
 * @author zhangyatao@baidu.com
 */

function EventEmitter() {
    this._events = this._events || {};
    this._maxListeners = this._maxListeners || undefined;
}

EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;


EventEmitter.defaultMaxListeners = 10;


EventEmitter.prototype.setMaxListeners = function (n) {
    if (!isNumber(n) || n < 0 || isNaN(n)) {
        throw TypeError('n must be a positive number');
    }
    this._maxListeners = n;
    return this;
};

EventEmitter.prototype.emit = function (type) {
    var er;
    var handler;
    var len;
    var args;
    var i;
    var listeners;

    if (!this._events) {
        this._events = {};
    }

    // If there is no 'error' event listener then throw.
    if (type === 'error') {
        if (!this._events.error || (isObject(this._events.error) && !this._events.error.length)) {
            er = arguments[1];
            if (er instanceof Error) {
                throw er; // Unhandled 'error' event
            } else {
                // At least give some kind of context to the user
                var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
                err.context = er;
                throw err;
            }
        }
    }

    handler = this._events[type];

    if (isUndefined(handler)) {
        return false;
    }


    if (isFunction(handler)) {
        switch (arguments.length) {
            // fast cases
            case 1:
                handler.call(this);
                break;
            case 2:
                handler.call(this, arguments[1]);
                break;
            case 3:
                handler.call(this, arguments[1], arguments[2]);
                break;
            // slower
            default:
                args = Array.prototype.slice.call(arguments, 1);
                handler.apply(this, args);
        }
    } else if (isObject(handler)) {
        args = Array.prototype.slice.call(arguments, 1);
        listeners = handler.slice();
        len = listeners.length;
        for (i = 0; i < len; i++) {
            listeners[i].apply(this, args);
        }

    }

    return true;
};

EventEmitter.prototype.addListener = function (type, listener) {
    var m;

    if (!isFunction(listener)) {
        throw TypeError('listener must be a function');
    }


    if (!this._events) {
        this._events = {};
    }

    if (this._events.newListener) {
        this.emit('newListener', type, isFunction(listener.listener) ? listener.listener : listener);
    }


    if (!this._events[type]) {
        this._events[type] = listener;
    } else if (isObject(this._events[type])) {
        this._events[type].push(listener);
    } else {
        this._events[type] = [this._events[type], listener];
    }


    // Check for listener leak
    if (isObject(this._events[type]) && !this._events[type].warned) {
        if (!isUndefined(this._maxListeners)) {
            m = this._maxListeners;
        } else {
            m = EventEmitter.defaultMaxListeners;
        }

        if (m && m > 0 && this._events[type].length > m) {
            this._events[type].warned = true;
            console.error('(node) warning: possible EventEmitter memory '
                + 'leak detected. %d listeners added. '
                + 'Use emitter.setMaxListeners() to increase limit.',
                this._events[type].length);
            if (typeof console.trace === 'function') {
                // not supported in IE 10
                console.trace();
            }
        }
    }

    return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function (type, listener) {
    if (!isFunction(listener)) {
        throw TypeError('listener must be a function');
    }


    var fired = false;

    function g() {
        this.removeListener(type, g);

        if (!fired) {
            fired = true;
            listener.apply(this, arguments);
        }
    }

    g.listener = listener;
    this.on(type, g);

    return this;
};

EventEmitter.prototype.removeListener = function (type, listener) {
    var list;
    var position;
    var length;
    var i;

    if (!isFunction(listener)) {
        throw TypeError('listener must be a function');
    }

    if (!this._events || !this._events[type]) {
        return this;
    }

    list = this._events[type];
    length = list.length;
    position = -1;

    if (list === listener || (isFunction(list.listener) && list.listener === listener)) {
        delete this._events[type];
        if (this._events.removeListener) {
            this.emit('removeListener', type, listener);
        }
    } else if (isObject(list)) {
        for (i = length; i-- > 0;) {
            if (list[i] === listener || (list[i].listener && list[i].listener === listener)) {
                position = i;
                break;
            }
        }

        if (position < 0) {
            return this;
        }

        if (list.length === 1) {
            list.length = 0;
            delete this._events[type];
        } else {
            list.splice(position, 1);
        }

        if (this._events.removeListener) {
            this.emit('removeListener', type, listener);
        }

    }

    return this;
};

EventEmitter.prototype.removeAllListeners = function (type) {
    var key;
    var listeners;

    if (!this._events) {
        return this;
    }

    if (!this._events.removeListener) {
        if (arguments.length === 0) {
            this._events = {};
        } else if (this._events[type]) {
            delete this._events[type];
        }
        return this;
    }

    if (arguments.length === 0) {
        for (key in this._events) {
            if (key === 'removeListener') continue;
            this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = {};
        return this;
    }

    listeners = this._events[type];

    if (isFunction(listeners)) {
        this.removeListener(type, listeners);
    } else if (listeners) {
        while (listeners.length) {
            this.removeListener(type, listeners[listeners.length - 1]);
        }
    }
    delete this._events[type];

    return this;
};

EventEmitter.prototype.listeners = function (type) {
    if (!this._events || !this._events[type]) {
        return [];
    }
    if (isFunction(this._events[type])) {
        return [this._events[type]];
    }
    return this._events[type].slice();
};

EventEmitter.prototype.listenerCount = function (type) {
    if (this._events) {
        var evlistener = this._events[type];

        if (isFunction(evlistener)) {
            return 1;
        }
        if (evlistener) {
            return evlistener.length;
        }
    }
    return 0;
};

EventEmitter.listenerCount = function (emitter, type) {
    return emitter.listenerCount(type);
};

function isFunction(arg) {
    return typeof arg === 'function';
}

function isNumber(arg) {
    return typeof arg === 'number';
}

function isObject(arg) {
    return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
    return arg === void 0;
}
module.exports.EventEmitter = EventEmitter;