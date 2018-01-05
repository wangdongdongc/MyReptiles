import * as yinwang from '../reptiles/yinwang'
import { History } from '../modules/mysql'
import { sendMessageToRabbitMQ } from '../modules/rabbitmq-telegram'

import { token, chat_id } from '../assets/auth_telegram'


/**
 * 任务：将王垠的新博文发送至相应 Bot
 */
export function task() {
    yinwang.getBlogs().then((blog_list) => {

        blog_list.forEach(blog => {

            const historyId: History.Identifier = { 
                type: History.Type.YINWANG,
                content: blog.title
            }

            History
            .contain(historyId)
            .then(isContain => {
                if  (! isContain) {
                    let text = `${blog.title}\n${blog.url}`
                    sendMessageToRabbitMQ(token.yinwang, chat_id.me, text, historyId)
                    History.insert(historyId)
                }
            })
        })

    }).catch((err) => {
        console.error(`yiwang#getBlogs fail: ${err.message}`)
    })
}