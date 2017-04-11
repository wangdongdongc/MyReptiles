import * as yinwang from '../reptiles/yinwang'
import { HistoryFile } from '../modules/history'
import { send_message_to_telegram } from '../modules/rabbitmq-telegram'

import { token, chat_id } from '../assets/auth_telegram'

const blogHistoryFile = 'yinwang-to-telegram--blog.json'
const maxBlogHistory = 300

/**
 * 任务：将王垠的新博文发送至相应 Bot
 */
export function task() {
    yinwang.getBlogs().then((blog_list) => {
        let history = new HistoryFile(blogHistoryFile, maxBlogHistory)

        blog_list.filter((blog) => {
            return !history.contain(blog.title)
        }).forEach((blog) => {
            let text = `${blog.title}\n${blog.url}`
            send_message_to_telegram(token.yinwang, chat_id.me, text)

            history.push(blog.title)
        })

        history.save()
    }).catch((err) => {
        console.error(`yiwang#getBlogs fail: ${err.message}`)
    })
}