import * as yinwang from '../reptiles/yinwang'
import { History } from '../modules/mysql'
import { send_message_to_telegram } from '../modules/rabbitmq-telegram'

import { token, chat_id } from '../assets/auth_telegram'


/**
 * 任务：将王垠的新博文发送至相应 Bot
 */
export function task() {
    yinwang.getBlogs().then((blog_list) => {

        blog_list.forEach(blog => {
            History
            .contain(History.Type.YINWANG, blog.title)
            .then(isContain => {
                if  (! isContain) {
                    let text = `${blog.title}\n${blog.url}`
                    send_message_to_telegram(token.yinwang, chat_id.me, text)
                    History.insert(History.Type.YINWANG, blog.title)
                }
            })
        })

    }).catch((err) => {
        console.error(`yiwang#getBlogs fail: ${err.message}`)
    })
}