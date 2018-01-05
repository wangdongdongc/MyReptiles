import * as bilibili from '../reptiles/bilibili'
import {History} from '../modules/mysql'
import {sendPhotoMsgToRabbitMQ} from '../modules/rabbitmq-telegram'

import {token, chat_id} from '../assets/auth_telegram'


/**
 * 任务: 将 Bilibil 上的新动态发送到 Telegram
 */
export function task() {
    bilibili.getRecentFeeds().then((feed_list) => {

        feed_list.forEach(feed => {

            const historyId: History.Identifier = {
                type: History.Type.BILIBILI,
                content: feed.title
            }

            History.contain(historyId).then(isContain => {
                if (!isContain) {
                    History.insert(historyId).then(_ => {
                        let caption
                        if (feed.type == bilibili.BBFeedType.Bangumi) {
                            caption = `${feed.title}：${feed.description}`
                        } else {
                            caption = `${feed.author}：${feed.title}`
                        }
                        sendPhotoMsgToRabbitMQ(
                            token.bilibili, chat_id.me, feed.pic, caption,
                            historyId)
                    })
                }
            })
        })

    })
}


/**
 * @debug
 */
if (process.argv.length >= 2 &&
    process.argv[1].indexOf('build/scripts/bilibili-to-telegram.js') != -1) {
    task()
}