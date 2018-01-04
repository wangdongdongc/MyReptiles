import * as bilibili from '../reptiles/bilibili'
import { History } from '../modules/mysql'
import { send_photo_to_telegram } from '../modules/rabbitmq-telegram'

import { token, chat_id } from '../assets/auth_telegram'


/**
 * 任务: 将 Bilibil 上的新动态发送到 Telegram
 */
export function task() {
    bilibili.getRecentFeeds().then((feed_list) => {

        feed_list.forEach(feed => {
            History
            .contain(History.Type.BILIBILI, feed.title)
            .then(isContain => {
                if (! isContain) {
                    let caption
                    if (feed.type == bilibili.BBFeedType.Bangumi) {
                        caption = `${feed.title}：${feed.description}`
                    } else {
                        caption = `${feed.author}：${feed.title}`
                    }
                    send_photo_to_telegram(token.bilibili, chat_id.me, feed.pic, caption)
                    History.insert(History.Type.BILIBILI, feed.title)
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