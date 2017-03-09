import * as biquge from './scripts/crontabs/biquge-to-telegram'
import * as tsdm from './scripts/crontabs/tsdm-to-telegram'
import * as tuicool from './scripts/crontabs/tuicool-to-telegram'
import * as yinwang from './scripts/crontabs/yinwang-to-telegram'
import * as zhihu from './scripts/crontabs/zhihu-to-telegram'

/**
 * 定时
 */
namespace Interval {
    const Second = 1000
    const Minute = 60 * Second
    export const Hour = 60 * Minute
    export const Day = 24 * Hour
}

/**
 * 每小时执行一次的任务
 */
setInterval(function() {
    biquge.task()
    tuicool.task()
    yinwang.task()
    zhihu.task()
}, Interval.Hour)


/**
 * 每天执行一次的任务
 */
setInterval(function() {
    tsdm.task()
}, 3 * Interval.Day)