import * as biquge from './scripts/biquge-to-telegram'
import * as tsdm from './scripts/tsdm-to-telegram'
import * as tuicool from './scripts/tuicool-to-telegram'
import * as yinwang from './scripts/yinwang-to-telegram'
import * as zhihu from './scripts/zhihu-to-telegram'
import * as bilibili from './scripts/bilibili-to-telegram'
import { RabbitMQWorker } from './modules/rabbitmq-telegram'

// tslint:disable-next-line:no-unused-variable
let worker = new RabbitMQWorker()
biquge.task()
tuicool.task()
yinwang.task()
zhihu.task()
bilibili.task()
tsdm.task()
