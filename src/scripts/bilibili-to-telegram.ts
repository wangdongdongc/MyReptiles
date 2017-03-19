import * as bilibili from '../reptiles/bilibili'
import { HistoryFile } from '../modules/history'
import { getBeijingDateStamp } from '../modules/localization'
import { send_message_to_telegram, send_photo_to_telegram } from '../modules/rabbitmq-telegram'

import { token, chat_id } from '../assets/auth_telegram'

const historyFile = 'bilibili-to-telegram.json'
const maxHistory = 100

/**
 * 任务: 将 Bilibil 上的新动态发送到 Telegram
 */
export function task() {
    bilibili.getRecentFeeds((err, feeds) => {
        if (err) {
            console.error(`bilibili#getRecentFeeds fail: ${err.message}`)
            return
        }

        let history = new HistoryFile(historyFile, maxHistory)

        feeds
            .filter((feed) => {
                return !history.contain(feed.title)
            })
            .forEach((feed) => {
                let caption = `${feed.author}:${feed.title}`
                send_photo_to_telegram(token.bilibili, chat_id.me, feed.pic, caption)
                history.push(feed.title)
            })

        history.save()
        console.log(`${getBeijingDateStamp()} Finish Script: bilibili-to-telegram`)
    })
}


/**
 * @debug
 */
if (process.argv.length >= 2 &&
    process.argv[1].indexOf('build/scripts/bilibili-to-telegram.js') != -1) {
    bilibili.getRecentFeeds((err, list) => {
        task()
        console.log(`END`)
    })
}