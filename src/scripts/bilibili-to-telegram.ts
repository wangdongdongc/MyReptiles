import { readHistorySync, writeHistorySync } from '../modules/history'
import { Mode, Message, sendMessage, sendImage } from '../modules/telegram'
import { BBFeed, getRecentFeeds, convertBBFeedToHTML } from '../reptiles/bilibili'
import { getBeijingDateStamp } from '../modules/localization'

import { token, chat_id } from '../assets/auth_telegram'

const historyFile = 'bilibili-to-telegram.json'
const maxHistory = 100

/**
 * 任务: 将 Bilibil 上的新动态发送到 Telegram
 */
export function task() {
    getRecentFeeds((err, feeds) => {
        if (err) {
            console.error(`bilibili#getRecentFeeds fail: ${err.message}`)
            return
        }

        let history_queue = readHistorySync(historyFile)

        for (let i = 0; i < feeds.length; i++) {
            let feed = feeds[i]

            if (history_queue.indexOf(feed.title) != -1) {
                continue
            }

            let mes: Message = {
                chat_id: chat_id.me,
                text: convertBBFeedToHTML(feed),
                parse_mode: Mode.html,
                disable_web_page_preview: false
            }

            sendMessage(token.bilibili, mes, (err, res) => {
                if (err)
                    console.error(`bilibili#sendMessage fail: ${feed.title}`)
            })
            sendImage(token.bilibili, mes.chat_id, feed.pic, (err, res) => {
                if (err)
                    console.error(`bilibili#sendMessage fail: ${feed.title}`)
            })

            if (history_queue.length >= maxHistory)
                history_queue.shift()
            history_queue.push(`${feed.title}`)
        }

        writeHistorySync(historyFile, history_queue)
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
    getRecentFeeds((err, list) => {
        task()
        console.log(`END`)
    })
}