/**
 * Created by zhangyatao on 2017/3/10.
 */
(function () {
    var times = 1;
    this.setpTest = function (fn) {
        setTimeout(function () {
            fn();
        }, times++ * 1000);
    }
}());
