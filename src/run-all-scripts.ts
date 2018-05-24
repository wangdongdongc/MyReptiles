import * as tsdm from './scripts/tsdm-to-telegram'
import * as tuicool from './scripts/tuicool-to-telegram'
import * as yinwang from './scripts/yinwang-to-telegram'
import * as zhihu from './scripts/zhihu-to-telegram'
import { RabbitMQWorker } from './modules/rabbitmq-telegram'
import { getBeijingDateStamp } from './modules/localization'

// tslint:disable-next-line:no-unused-variable
let worker = new RabbitMQWorker()
tuicool.task()
yinwang.task()
zhihu.task()
tsdm.task()

const SECOND = 1000
const MINUTE = 60 * SECOND
/** 一段时间后关闭脚本 */
setTimeout(() => {
    console.log(`${getBeijingDateStamp()} 关闭脚本`)
    process.exit(0)
}, 3 * MINUTE)