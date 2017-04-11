import * as bilibili from '../reptiles/bilibili'
import { HistoryFile } from '../modules/history'
import { send_photo_to_telegram } from '../modules/rabbitmq-telegram'

import { token, chat_id } from '../assets/auth_telegram'

const historyFile = 'bilibili-to-telegram.json'
const maxHistory = 100

/**
 * 任务: 将 Bilibil 上的新动态发送到 Telegram
 */
export function task() {
    bilibili.getRecentFeeds().then((feed_list) => {
        let history = new HistoryFile(historyFile, maxHistory)

        feed_list.filter((feed) => {
            return !history.contain(feed.title)
        }).forEach((feed) => {
            let caption = `${feed.author}:${feed.title}`

            send_photo_to_telegram(token.bilibili, chat_id.me, feed.pic, caption)

            history.push(feed.title)
        })

        history.save()
    })
}


/**
 * @debug
 */
if (process.argv.length >= 2 &&
    process.argv[1].indexOf('build/scripts/bilibili-to-telegram.js') != -1) {
    task()
}