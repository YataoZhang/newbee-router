/**
 * Created by zhangyatao on 2017/3/9.
 */

require('./assign');
var EventEmitter = require('./event').EventEmitter;

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

