import * as yinwang from '../reptiles/yinwang'
import { HistoryFile } from '../modules/history'
import { getBeijingDateStamp } from '../modules/localization'
import { send_message_to_telegram } from '../modules/rabbitmq-telegram'

import { token, chat_id } from '../assets/auth_telegram'

const blogHistoryFile = 'yinwang-to-telegram--blog.json'
const tweetHistoryFile = 'yinwang-to-telegram--tweet.json'
const maxBlogHistory = 300
const maxTweetHistory = 1000

/**
 * 任务：将王垠的新博文发送至相应 Bot
 */
export function task() {
    yinwang.getBlogs((err, blogList: yinwang.Blog[]) => {
        if (err) {
            console.error(`yiwang#getBlogs fail: ${err.message}`)
            return
        }

        let history = new HistoryFile(blogHistoryFile, maxBlogHistory)

        blogList
            .filter((blog) => {
                return !history.contain(blog.title)
            })
            .forEach((blog) => {
                let text = `${blog.title}\n${blog.url}`
                send_message_to_telegram(token.yinwang, chat_id.me, text)

                history.push(blog.title)
            })

        history.save()
        console.log(`${getBeijingDateStamp()} Finish Script: yinwang-to-telegram `)
    })
}