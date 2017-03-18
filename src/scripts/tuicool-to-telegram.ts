import * as tuicool from '../reptiles/tuicool'
import { HistoryFile } from '../modules/history'
import { getBeijingDateStamp } from '../modules/localization'
import { send_message_to_telegram } from '../modules/rabbitmq-telegram'

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

        let history = new HistoryFile(historyFile, maxHistory)

        for (let i = 0; i < artList.length; i++) {
            let article = artList[i]

            if (history.contain(article.title))
                continue

            let text = `*${article.title}*\n${article.link}\n${article.cut}`
            send_message_to_telegram(token.tuibool, chat_id.me, text)

            history.push(article.title)
        }
        
        history.save()
        console.log(`${getBeijingDateStamp()} Finish Script: tuicool-to-telegram`)
    })
}