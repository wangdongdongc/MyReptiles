import * as tsdm from '../reptiles/tsdm'
import {History} from '../modules/mysql'

import {sendMessageToRabbitMQ} from '../modules/rabbitmq-telegram'

import {token, chat_id} from '../assets/auth_telegram'


/**
 * 任务: 将天使动漫论坛"轻文社"的新帖子发送到相应 Bot
 */
export function task() {

    tsdm.getRecentNovels().then((novel_list) => {

        novel_list.forEach(novel => {

            const historyId: History.Identifier = {
                type: History.Type.TSDM,
                content: novel.title
            }

            History.contain(historyId).then(isContain => {
                if (!isContain) {
                    History.insert(historyId).then(_ => {
                        let text = `*${novel.tag}* ${novel.title}\n${novel.link}`
                        sendMessageToRabbitMQ(token.tsdm, chat_id.me, text, historyId)
                    })
                }
            })
        })

    }).catch((err) => {
        console.error(`tsdm#getRecentNovels fail: ${err.message}`)
    })
}


/**
 * @debug
 */
if (process.argv.length >= 2 &&
    process.argv[1].indexOf('build/scripts/tsdm-to-telegram.js') != -1) {
    task()
}