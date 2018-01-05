import * as tuicool from '../reptiles/tuicool'
import { History } from '../modules/mysql'
import { sendMessageToRabbitMQ } from '../modules/rabbitmq-telegram'

import { token, chat_id } from '../assets/auth_telegram'


/**
 * 任务：将推酷网上最新的新闻发送至对应的 Bot
 */
export function task() {
    tuicool.getRecentArticles().then((article_list) => {

        article_list.forEach(article => {

            const historyId: History.Identifier = {
                type: History.Type.TUICOOL,
                content: article.title
            }

            History
            .contain(historyId)
            .then(isContain => {
                if (! isContain) {
                    let text = `*${article.title}*\n${article.link}\n${article.cut}`
                    sendMessageToRabbitMQ(token.tuibool, chat_id.me, text, historyId)
                    History.insert(historyId)
                }
            })
        })

    }).catch((err) => {
        console.error(`tuicool#getRecentArticles fail: ${err.message}`)
    })
}