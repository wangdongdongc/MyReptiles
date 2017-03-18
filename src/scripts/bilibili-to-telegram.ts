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

        for (let i = 0; i < feeds.length; i++) {
            let feed = feeds[i]

            if (history.contain(feed.title)) 
                continue

            let caption = `${feed.author}:${feed.title}`

            send_photo_to_telegram(token.bilibili, chat_id.me, feed.pic, caption)

            history.push(feed.title)
        }

        history.save()
        console.log(`${getBeijingDateStamp()} Finish Script: bilibili-to-telegram`)
    })
}


/**
 * @debug
 * 仅当本文件对应的 JS 文件被 node 直接执行使, 该段代码生效
 */
if (process.argv.length >= 2 &&
    process.argv[1].indexOf('build/scripts/bilibili-to-telegram.js') != -1) {
    //node bilibili-to-telegram.js
    bilibili.getRecentFeeds((err, list) => {
        task()
        console.log(`END`)
    })
}