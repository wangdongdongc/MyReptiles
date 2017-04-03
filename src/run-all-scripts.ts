import * as biquge from './scripts/biquge-to-telegram'
import * as tsdm from './scripts/tsdm-to-telegram'
import * as tuicool from './scripts/tuicool-to-telegram'
import * as yinwang from './scripts/yinwang-to-telegram'
import * as zhihu from './scripts/zhihu-to-telegram'
import * as bilibili from './scripts/bilibili-to-telegram'
import { TelegramWorker } from './modules/rabbitmq-telegram'
import { getBeijingDateStamp } from './modules/localization'

/**
 * 定时
 */
namespace Interval {
    const Second = 1000
    export const Minute = 60 * Second
    export const Hour = 60 * Minute
    export const Day = 24 * Hour
}

function run_all_tasks() {
    // tslint:disable-next-line:no-unused-variable
    let worker = new TelegramWorker()
    biquge.task()
    tuicool.task()
    yinwang.task()
    zhihu.task()
    bilibili.task() // 2017/3/16
    tsdm.task()
}

console.log(`${getBeijingDateStamp()} Begin Reptiles`)

run_all_tasks()

/** 将进程维持 1 个小时 */
setTimeout(function() {
    console.log(`${getBeijingDateStamp()} End Reptiles`)
    process.exit()
}, Interval.Minute)