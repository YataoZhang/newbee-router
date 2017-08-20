/**
 * @file queryAdapter.js
 * @author zhangyatao
 */

var _ = require('underscore');
var bindHashChange = require('./bindHashChange.js');
var QUERY_REG = /[?&]([^=&?/]+)(=([^=&?/]+))?/g;

/**
 * Query
 * @constructor
 */
function Query() {
    this.__keyList__ = {};
    this.hashWatch = false;
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
    this.set(key, false);
};
Query.prototype.get = function (key) {
    var hash = location.hash;
    var result = hash.match(new RegExp('[?&]' + key + '=([^&=?/]+)', 'i'));
    if (result && result.length && result[1]) {
        return result[1];
    }
    return null;
};
Query.prototype.set = function (name, value) {
    var query = {};
    if (_.isString(name)) {
        query[name] = value ? String(value) : '';
    } else if (_.isObject(name)) {
        if ('name' in name && 'value' in name) {
            query[name.name] = name.value ? String(name.value) : '';
        } else {
            _.each(name, function (v, k) {
                if (v && k) {
                    query[k] = v ? String(v) : '';
                }
            });
        }
    }

    var hash = location.hash;
    _.each(query, function (value, name) {

        value = encodeURIComponent(value);
        name = encodeURIComponent(name);

        var reg = new RegExp('([?&])(' + name + '=)[^&=?/]+(&?)', 'g');
        // 增加hash
        if (!reg.test(hash)) {
            hash = hash + (/\?/.test(hash) ? '&' : '?') + name + '=' + value;
        } else {
            // 删除或修改hash
            hash = hash.replace(reg, function (str, $1, $2, $3) {
                // 删除
                if (!value) {
                    if ($1 === '&')
                        return $3;
                    if ($3)
                        return $1;
                    return '';
                }

                // 修改
                return $1 + $2 + value + $3;
            });
        }
    });

    if (hash !== location.hash) {
        location.hash = hash;
    }
};

/**
 * 监听hash的改变
 * @private
 */
Query.prototype._watch = function () {

    var that = this;

    bindHashChange(function (newURL, oldURL) {
        if (!this.hashWatch) {
            return;
        }

        if (newURL === oldURL) {
            return
        }

        // 得到新hash中所有key/value
        var newQuery = this.getAll(newURL);
        // 得到旧hash中所有key/value
        var oldQuery = this.getAll(oldURL);

        // 对比key不同的query，触发回掉函数
        _.each(newQuery, function (newKey, newValue) {

            if (!newValue) {
                return;
            }

            var oldValue = oldQuery[newKey];

            // newKey为新添加的query
            if (!oldValue) {
                return;
            }

            // query没有改变
            if (newValue === oldValue) {
                return;
            }

            var watchList = that.__keyList__[newKey].watch;
            if (_.isFunction(watchList)) {
                watchList.call(null, newValue, oldValue);
            } else {
                _.each(watchList, function (watchFn) {
                    watchFn.call(null, newValue, oldValue);
                });
            }

        });
    });
};

/**
 * 监听query改版的回掉函数
 * @param name
 * @param fn
 */
Query.prototype.watch = function (name, fn) {
    if (name && _.isString(name) && _.isFunction(fn)) {
        var queryInfo = this.__keyList__[name];
        if (queryInfo) {
            this.hashWatch = true;
            if (_.isArray(queryInfo.watch)) {
                queryInfo.watch.push(fn);
            } else {
                queryInfo.watch = [queryInfo.watch, fn];
            }
        }
    }
};

Query.prototype.getAll = function (queryStr) {
    var query = {};
    while (QUERY_REG.exec(queryStr || location.hash)) {
        RegExp.$1 && (query[RegExp.$1] = RegExp.$3 || '');
    }
    return query;
};

module.exports = Query;
