/**
 * @file router.js
 * @author zhangyatao
 */

var _ = require('underscore');
var bindHashChange = require('./bindHashChange.js');
var inherits = require('inherits');
var EventEmitter = require('events').EventEmitter;

var Query = require('./Query.js');
var pathReg = /#([^?]*)\??/;

function normal(href, reg) {
    return (href.match(reg) || [, ''])[1];
}
/**
 * NewBeeRouter
 * @param options
 * @constructor
 */
function NewBeeRouter(options) {
    options || (options = {});
    EventEmitter.call(this);
    // {routes:[{...},{...}]}
    // {routes:{...}}

    this._routes = [];
    this.query = new Query();

    var route = options.routes;
    if (route) {
        this.addRoute(route);
    }

    this._init();
}
inherits(NewBeeRouter, EventEmitter);

NewBeeRouter.prototype._init = function () {

    var that = this;

    bindHashChange(function (newURL, oldURL) {
        if (newURL === oldURL) {
            return;
        }
        var newPath = normal(newURL, pathReg);
        var oldPath = normal(oldURL, pathReg);

        if (newPath === oldPath) {
            return;
        }

        var oldRouter = that.getCurrentRouter(oldPath).route;
        var newRouterInfo = that.getCurrentRouter(newPath);

        var newRouter = newRouterInfo.route;
        if (oldRouter) {
            oldRouter._emitter.emit('leave', newRouter && newRouter.path);
            that.emit('eachLeave', newRouter && newRouter.path);
        }
        if (newRouter) {
            newRouter._emitter.emit('enter', oldRouter && oldRouter.path);
            newRouter._emitter.emit('render', newRouter.name, newRouterInfo.params);
            that.emit('eachEnter', oldRouter && oldRouter.path);
        }
    });


    var currentRouterInfo = this.getCurrentRouter();
    var currentRouter = currentRouterInfo.route;
    if (currentRouter) {
        currentRouter._emitter.emit('enter', currentRouter.path);
        currentRouter._emitter.emit('render', currentRouter.name, currentRouterInfo.params);
        that.emit('eachEnter');
        return;
    }


    // 当前没有hash或者hash不是标准的，则使用默认的路由。
    var hasDefault = _.find(this._routes, function (item) {
        return item.isDefault === true && !item._hasParams;
    });

    hasDefault && this.push(hasDefault);
};

NewBeeRouter.prototype.getCurrentRouter = function (path) {
    if (path === '') {
        return {
            route: null,
            params: {}
        };
    }
    if (path === undefined || path === null) {
        var hash = location.hash;
        path = normal(hash);
        if (!path) {
            return {
                route: null,
                params: {}
            };
        }
    }

    var params = {};
    var route = _.find(this._routes, function (item) {
        if (!item._hasParams) {
            return item.path === path;
        }

        var reg = new RegExp(item._paramPath);
        if (reg.test(path)) {
            path.replace(reg, function () {
                var paramsList = [].slice.call(arguments, 1, item._params.length + 1);
                _.each(item._params, function (param, index) {
                    params[param] = paramsList[index] || '';
                });
            });
            return true;
        }
    });


    return {route: route, params: params};

};

NewBeeRouter.prototype.addRoute = function (route) {
    // {...}
    // [{...},{...}]
    var that = this;

    if (!_.isArray(route)) {
        route = [route];
    }

    _.each(route, function (routeItem) {

        routeItem = Object.assign({}, {
            path: '',
            name: '',
            isDefault: false,
            enter: null,
            leave: null,
            render: null,
            _emitter: new EventEmitter()
        }, routeItem);

        if (!/^\//.test(routeItem.path)) {
            routeItem.path = '/' + routeItem.path;
        }

        var isExists = _.some(that._routes, function (r) {
            return r.path === routeItem.path;
        });

        if (isExists) {
            return;
        }

        if (/\/:([^/])+/.test(routeItem.path)) {
            var arr = [];
            routeItem._hasParams = true;
            routeItem._paramPath = routeItem.path.replace(/:([^\/]+)/g, function (str, param) {
                arr.push(param);
                return '([^\/]+)';
            });
            routeItem._params = arr;
        }

        _.each(['enter', 'leave', 'render'], function (type) {
            if (_.isFunction(routeItem[type])) {
                routeItem._emitter.on(type, routeItem[type]);
                routeItem[type] = void 0;
            }
        });

        that._routes.push(routeItem);

    });

};
NewBeeRouter.prototype.push = function (path) {
    // 'name'
    // {'path':'name'}
    // {name:'',params:{'a':1,'b':2}}
    // {name:'',query:{'a':1,'b':2}}
    var info = {path: '', name: '', params: {}, query: {}};
    if (_.isString(path)) {
        info.path = path.replace(/^[#/]+/, '');
    }
    if (_.isObject(path)) {
        info = Object.assign({}, info, path);
    }

    // route必须有path或者name，
    if (!info.path && !info.name) {
        return;
    }

    // create query
    var query = [];

    // add locked query
    for (var key in this.query.__keyList__) {
        if (!this.query.__keyList__.hasOwnProperty(key)) {
            continue;
        }
        var item = this.query.__keyList__[key];
        if (item.locked && !(key in info.query)) {
            var queryValue = this.query.get(key);
            queryValue && (info.query[key] = this.query.get(key));
        }
    }

    for (var n in info.query) {
        if (!info.query.hasOwnProperty(n)) {
            continue;
        }
        query.push(encodeURIComponent(n) + '=' + encodeURIComponent(info.query[n]));
    }

    query = query.join('&');

    // create path
    var terminalPath = '';
    if (info.path) {
        terminalPath = '#/' + info.path;
    } else {
        // find next router
        var nextRoute = this.getRouterConfig(info.name);

        if (!nextRoute) {
            console.warn('no get route name : ', info.name);
            return;
        }

        if (nextRoute._hasParams) {
            var spreadPath = nextRoute._paramPath.split('/([^/]+)');

            _.each(nextRoute._params, function (item) {
                if (!(item in info.params)) {
                    throw new Error('no params : ', item);
                }
                terminalPath += spreadPath.shift() + '/' + info.params[item];
            });
            terminalPath += spreadPath.join('');

        } else {
            terminalPath = nextRoute.path;
        }
    }


    if (query) {
        terminalPath += '?' + query;
    }
    location.hash = terminalPath;
};

NewBeeRouter.prototype.eachLeave = function (cb) {
    this.on('eachLeave', cb)
};

NewBeeRouter.prototype.eachEnter = function (cb) {
    this.on('eachEnter', cb)
};
NewBeeRouter.prototype.getRouterConfig = function (routerName) {
    return _.find(this._routes, function (item) {
        return item.name === routerName;
    });
};

_.each(['enter', 'leave', 'render'], function (type) {
    NewBeeRouter.prototype['on' + type.replace(/^[a-z]/, function (x) {
        return x.toUpperCase();
    })] = function (routerName, cb) {
        if (!_.isFunction(cb)) {
            return;
        }
        var route = this.getRouterConfig(routerName);
        route && route._emitter.on(type, cb);
    };
});

NewBeeRouter.app = new NewBeeRouter();

module.exports = NewBeeRouter;
