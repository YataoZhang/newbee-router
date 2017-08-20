/**
 * @file helper.js
 * @author zhangyatao
 */
var _ = require('underscore');
var EventEmitter = require('events').EventEmitter;
var emitter = new EventEmitter();
var HISTORY_IFRAME_ID = 'historyIFrameEmulator';

var stackEmulator = {
    iFrame: null,
    hash: location.hash,
    url: location.href,
    timer: 0,
    buildIFrame: function () {
        var iframe = document.getElementById(HISTORY_IFRAME_ID);

        if (iframe) {
            this.iFrame = iframe;
            this.addState('');
            this.mockHashChange();
        }
    },
    dispose: function () {
        this.iFrame = null;
        clearInterval(this.timer);
    },
    addState: function (state) {
        if (!this.iFrame) {
            return;
        }
        try {
            var doc = this.iFrame.contentWindow.document;
            doc.open();
            doc.writeln('<html><body>' + state + '</body></html>');
            doc.close();
        } catch (e) {
            this.dispose();
        }
    },
    mockHashChange: function () {
        var that = this;
        this.timer = setInterval(function () {
            var hash = location.hash;
            var newURL = '';
            var oldURL = '';

            if (that.hash != hash) {
                that.addState(hash);

                newURL = location.href;
                oldURL = that.url;

                setTimeout(function () {
                    emitter.emit('hashchange', newURL, oldURL);
                }, 0);

                that.hash = hash;
                that.url = location.href;
            } else {
                try {
                    var state = that.iFrame.contentWindow.document.body.innerText.replace(/^\s+|\s+$/g, '');
                    if (state !== hash) {
                        oldURL = location.href;

                        that.hash = location.hash = state;
                        newURL = that.url = location.href;

                        setTimeout(function () {
                            emitter.emit('hashchange', newURL, oldURL);
                        }, 0);

                        that.hash = location.hash = state;
                        that.url = location.href;
                    }
                } catch (e) {
                    this.dispose();
                }
            }
        }, 1000);
    },
    init: function () {
        var msie = document.documentMode;
        var isSupport = (msie && msie >= 8) || window.HashChangeEvent != undefined;
        if (!isSupport) {
            this.buildIFrame();
        } else {
            var hashChange = _.throttle(function (e) {
                _.defer(function (newURL, oldURL) {
                    emitter.emit('hashchange', newURL, oldURL);
                }, e.newURL || '', e.oldURL || '');
            }, 300);

            if (window.addEventListener) {
                window.addEventListener('hashchange', hashChange, false)
            } else {
                window.attachEvent('onhashchange', hashChange);
            }
        }
    }
};

stackEmulator.init();

module.exports = function (fn) {
    emitter.on('hashchange', fn);
};
