(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["NewBeeRouter"] = factory();
	else
		root["NewBeeRouter"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/* unknown exports provided */
/* all exports used */
/*!***********************!*\
  !*** ./src/assign.js ***!
  \***********************/
/***/ (function(module, exports) {

/**
 * Created by zhangyatao on 2017/3/9.
 */
if (typeof Object.assign != 'function') {
    Object.assign = function (target, varArgs) { // .length of function is 2
        'use strict';
        if (target == null) { // TypeError if undefined or null
            throw new TypeError('Cannot convert undefined or null to object');
        }

        var to = Object(target);

        for (var index = 1; index < arguments.length; index++) {
            var nextSource = arguments[index];

            if (nextSource != null) { // Skip over if undefined or null
                for (var nextKey in nextSource) {
                    // Avoid bugs when hasOwnProperty is shadowed
                    if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                        to[nextKey] = nextSource[nextKey];
                    }
                }
            }
        }
        return to;
    };
}

/***/ }),
/* 1 */
/* unknown exports provided */
/* all exports used */
/*!**********************!*\
  !*** ./src/event.js ***!
  \**********************/
/***/ (function(module, exports) {

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

/***/ }),
/* 2 */
/* unknown exports provided */
/* all exports used */
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/***/ (function(module, exports, __webpack_require__) {

/**
 * Created by zhangyatao on 2017/3/9.
 */

__webpack_require__(/*! ./assign */ 0);
var EventEmitter = __webpack_require__(/*! ./event */ 1).EventEmitter;

function getType(type) {
    return function (data) {
        return Object.prototype.toString.call(data) === '[object ' + type + ']';
    }
}

var isObject = getType('Object');
var isArray = getType('Array');
var isString = getType('String');
var emitter = new EventEmitter();
var queryReg = /#[^?]*\?(.+)$/;
var pathReg = /#([^?]+)/;

function normal(href, reg) {
    var query = href.match(reg) || '';
    if (query && query.length && query[1]) {
        query = query[1] || '';
    }
    return query;
}

function hashChangePolyfill() {
    var msie = document.documentMode;
    var isSupport = (msie && msie >= 8) || window.HashChangeEvent != undefined;


    function init() {
        var hash = location.hash;
        var url = location.href;
        setInterval(function () {
            if (hash != location.hash) {
                var eventArgs = new HashChangeEvent("hashchange");
                eventArgs.oldURL = url;
                eventArgs.newURL = location.href;
                emitter.emit('hashchange', eventArgs);
            }
            hash = location.hash;
            url = location.href;

        }, 100);
    }

    if (!isSupport) {
        window.HashChangeEvent = function (type) {
            this.isTrusted = true;
            this.oldURL = "";
            this.newURL = "";
            this.type = type;
        };

        init();
    } else {
        function hashChange(e) {
            emitter.emit('hashchange', e);
        }

        if (window.addEventListener) {
            window.addEventListener('hashchange', hashChange, false)
        } else {
            window.attachEvent('onhashchange', hashChange);
        }
    }
}

hashChangePolyfill();

function Query() {

    this.__keyList__ = {};
    this._watch();
}

Query.prototype.add = function (options) {
    // {name:'',value:'',locked:true,watch:function(){}}
    var _options = Object.assign({}, {
        name: '',
        value: '',
        locked: false,
        watch: function (to, from) {

        }
    }, options);
    if (!_options.name || !_options.value || typeof _options.watch !== 'function') {
        throw new Error('no name、value or watch function.');
    }
    this.__keyList__[_options.name] = _options;
    this.set(_options.name, _options.value);
};
Query.prototype.remove = function (key) {
    this.set(key, null);
};
Query.prototype.get = function (key) {
    return this.set(key);
};
Query.prototype.set = function (name, value) {
    // key was exists or not
    if (!isString(name) || name == "") {
        return;
    }

    var hash = location.hash;
    value = encodeURIComponent(value);
    name = encodeURIComponent(name);

    // 获取hash
    if (value === 'undefined') {
        var result = hash.match(new RegExp("&*\\b" + name + "=([^&]*)", "i"));
        if (result && result.length && result[1]) {
            return result[1];
        }
        return null;
    }

    if (!new RegExp('[?&]' + name + '=[^?]+').test(hash)) {
        return location.hash = hash + (/\?/.test(hash) ? '&' : '?') + name + '=' + value;
    }

    // 删除或修改hash
    location.hash = hash.replace(new RegExp('([?&])(' + name + '=)[^?&]+(&?)', 'g'), function (str, $1, $2, $3) {
        // 删除
        if (value === '' || value === 'null') {
            if ($1 === '&')
                return $3;
            if ($3)
                return $1;
            return '';
        } else {
            return $1 + $2 + value;
        }

    });
};
Query.prototype._watch = function () {


    var that = this;
    emitter.on('hashchange', function (e) {
        if (!/#.*\?/.test(e.newURL)) {
            return;
        }
        var newQuery = normal(e.newURL, queryReg);
        var oldQuery = normal(e.oldURL, queryReg);
        if (oldQuery === newQuery) {
            return
        }
        newQuery = newQuery.split('&').map(function (item) {
            item = item.split('=');
            return {name: item[0], value: item[1]};
        });
        oldQuery = oldQuery.split('&').map(function (item) {
            item = item.split('=');
            return {name: item[0], value: item[1]};
        });
        newQuery.forEach(function (_new) {
            var _old = oldQuery.find(function (item) {
                return item.name === _new.name;
            });
            if (_old && _new.value !== _old.value) {
                that.__keyList__[_new.name].watch(_new.value, _old.value);
            }
        });
    });
};


function NewBeeRouter(options) {
    // {routes:[{...},{...}]}
    // {routes:{...}}
    var _options = {
        routes: []
    };

    this._routes = [];
    this.query = new Query();

    options = Object.assign({}, _options, options);

    var route = options.routes;
    if (isArray(route) || isObject(route)) {
        this.addRoute(route);
    }

    this._init();

}

NewBeeRouter.prototype._init = function () {
    var that = this;
    emitter.on('hashchange', function (e) {
        var newPath = normal(e.newURL, pathReg);
        var oldPath = normal(e.oldURL, pathReg);
        if (newPath === oldPath) {
            return;
        }
        var oldRouter = that._getCurrentRouter(oldPath)[0];
        var newRouterInfo = that._getCurrentRouter(newPath);
        var newRouter = newRouterInfo[0];
        if (oldRouter && newRouter) {
            oldRouter.leave(newRouter && newRouter.path);
            emitter.emit('eachLeave', newRouter && newRouter.path);
            newRouter.enter(oldRouter && oldRouter.path);
            newRouter.render(newRouterInfo[1]);
            emitter.emit('eachEnter', oldRouter && oldRouter.path);
        }
    });
    if (location.hash) {
        var currentRouterInfo = this._getCurrentRouter();
        var currentRouter = currentRouterInfo[0];
        if (currentRouter) {
            currentRouter.enter();
            currentRouter.render(currentRouterInfo[1]);
            return;
        }
    }
    var hasDefault = this._routes.find(function (item) {
        return item.defaultPath === true && !item._hasParams;
    });
    if (!hasDefault) {
        throw new Error('no default path');
    }
    this.push(hasDefault.path);

};

NewBeeRouter.prototype._getCurrentRouter = function (path) {
    if (!path) {
        var hash = location.hash || '#/';
        path = hash.match(/#([^?]+)/);
        if (path && path.length && path[1]) {
            path = path[1];
        } else {
            console.warn('wrong path:', hash);
            return null;
        }
    }

    var params = {};
    var route = this._routes.find(function (item) {
        if (item._hasParams && new RegExp(item._paramPath).test(path)) {
            path.replace(new RegExp(item._paramPath), function () {
                var paramsList = [].slice.call(arguments, 1, item._params.length + 1);
                item._params.forEach(function (param, index) {
                    params[param] = paramsList[index]
                });
            });
            return true;
        } else {
            return item.path === path;
        }
    });

    return [route, params];
};
NewBeeRouter.prototype.getCurrentRouter = function () {
    return this._getCurrentRouter();
};

NewBeeRouter.prototype.addRoute = function (route) {
    // {...}
    // [{...},{...}]
    var that = this;
    var _route = {
        path: '',
        name: '',
        defaultPath: false,
        component: null,
        enter: function () {
        },
        leave: function () {
        },
        render: function () {

        }
    };
    if (isObject(route)) {
        _route = [Object.assign({}, _route, route)];
    }
    if (isArray(route)) {
        route.forEach(function (item) {
            if (!/^\//.test(item.path)) {
                item.path = '/' + item.path;
            }
            var isExists = that._routes.some(function (r) {
                return item.path && r.path === item.path;
            });
            if (!isExists) {
                if (/\/:([^/])+/.test(item.path)) {
                    item._hasParams = true;
                    var arr = [];
                    item._paramPath = item.path.replace(/:([^\/]+)/g, function () {
                        arr.push(arguments[1]);
                        return '([^\/]+)';
                    });
                    item._params = arr;
                }
                that._routes.push(Object.assign({}, _route, item));
            }
        });
    }

};
NewBeeRouter.prototype.push = function (path) {
    // 'name'
    // {'path':'name'}
    // {name:'',params:{'a':1,'b':2}}
    // {name:'',query:{'a':1,'b':2}}
    var info = {path: '', name: '', params: {}, query: {}};
    if (isString(path)) {
        info.path = path.replace(/^\//, '');
    }
    if (isObject(path)) {
        info = Object.assign({}, info, path);
    }

    if (info.path) {
        location.hash = '#/' + info.path;
        return;
    }
    if (!info.name) {
        console.warn('no set route name');
        return;
    }

    var nextRoute = this._routes.find(function (item) {
        return item.name === info.name;
    });

    if (!nextRoute) {
        console.warn('no get route name : ', info.name);
        return;
    }

    var completePath = '';

    if (nextRoute._hasParams) {
        var spreadPath = nextRoute._paramPath.split('/([^/]+)');

        nextRoute._params.forEach(function (item) {
            if (!(item in info.params)) {
                throw new Error('no params : ', item);
            }
            completePath += spreadPath.shift() + '/' + info.params[item];
        });
        completePath += spreadPath.join('');

    } else {
        completePath = nextRoute.path;
    }
    var arr = [];

    // add locked query
    for (var key in this.query.__keyList__) {
        if (!this.query.__keyList__.hasOwnProperty(key)) {
            continue;
        }
        var item = this.query.__keyList__[key];
        if (item.locked && !(key in info.query)) {
            info.query[key] = this.query.get(key);
        }
    }


    for (var n in info.query) {
        if (!info.query.hasOwnProperty(n)) {
            continue;
        }
        arr.push(encodeURIComponent(n) + '=' + encodeURIComponent(info.query[n]));
    }
    arr = arr.join('&');

    if (arr) {
        completePath += '?' + arr;
    }
    location.hash = completePath;
};

NewBeeRouter.prototype.eachLeave = function (cb) {
    emitter.on('eachLeave', cb)
};

NewBeeRouter.prototype.eachEnter = function (cb) {
    emitter.on('eachEnter', cb)
};
module.exports = NewBeeRouter;



/***/ })
/******/ ]);
});