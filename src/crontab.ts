import * as biquge from './scripts/biquge-to-telegram'
import * as tsdm from './scripts/tsdm-to-telegram'
import * as tuicool from './scripts/tuicool-to-telegram'
import * as yinwang from './scripts/yinwang-to-telegram'
import * as zhihu from './scripts/zhihu-to-telegram'
import * as bilibili from './scripts/bilibili-to-telegram'

/**
 * 定时
 */
namespace Interval {
    const Second = 1000
    const Minute = 60 * Second
    export const Hour = 60 * Minute
    export const Day = 24 * Hour
}


(/**
 * 启动时立即执行一次
 */function firstExecute(){
    biquge.task()
    tuicool.task()
    yinwang.task()
    zhihu.task()
    bilibili.task() // 2017/3/16

    tsdm.task()
})()


/**
 * 每小时执行一次
 */
setInterval(function() {
    biquge.task()
    tuicool.task()
    yinwang.task()
    zhihu.task()
    bilibili.task()
}, Interval.Hour)


/**
 * 每天执行一次
 */
setInterval(function() {
    tsdm.task()
}, Interval.Day)