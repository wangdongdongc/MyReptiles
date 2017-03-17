import * as telegram from '../modules/telegram'
import { readHistorySync, writeHistorySync } from '../modules/history'
import * as tuicool from '../reptiles/tuicool'
import { getBeijingDateStamp } from '../modules/localization'

import { token, chat_id } from '../assets/auth_telegram'

const historyFile = 'tuicool-to-telegram.json'
const maxHistory = 200

/**
 * 任务：将推酷网上最新的新闻发送至对应的 Bot
 */
export function task() {
    tuicool.getRecentArticles((err: Error, artList: tuicool.Article[]) => {
        if (err) { 
            console.error(`tuicool#getRecentArticles fail: ${err.message}`)
            return
        }

        let history_queue = readHistorySync(historyFile)

        for (let i = 0; i < artList.length; i++) {
            let article = artList[i]

            if (history_queue.indexOf(article.title) != -1) {
                continue
            }

            let mes: telegram.Message = {
                chat_id: chat_id.me,
                text: `*${article.title}*\n${article.link}\n${article.cut}`,
                parse_mode: telegram.MessageMode.markdown,
            }

            telegram.sendMessage(token.tuibool, mes, (err, res) => {
                if (err)
                    console.error(`tuicool#sendMessage fail: ${article.title}`)
            })

            if (history_queue.length >= maxHistory)
                history_queue.shift()
            history_queue.push(article.title)
        }
        
        writeHistorySync(historyFile, history_queue)
        console.log(`${getBeijingDateStamp()} Finish Script: tuicool-to-telegram`)
    })
}