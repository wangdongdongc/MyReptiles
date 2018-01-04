import * as tuicool from '../reptiles/tuicool'
import { History } from '../modules/mysql'
import { send_message_to_telegram } from '../modules/rabbitmq-telegram'

import { token, chat_id } from '../assets/auth_telegram'


/**
 * 任务：将推酷网上最新的新闻发送至对应的 Bot
 */
export function task() {
    tuicool.getRecentArticles().then((article_list) => {

        article_list.forEach(article => {
            History
            .contain(History.Type.TUICOOL, article.title)
            .then(isContain => {
                if (! isContain) {
                    let text = `*${article.title}*\n${article.link}\n${article.cut}`
                    send_message_to_telegram(token.tuibool, chat_id.me, text)
                    History.insert(History.Type.TUICOOL, article.title)
                }
            })
        })

    }).catch((err) => {
        console.error(`tuicool#getRecentArticles fail: ${err.message}`)
    })
}