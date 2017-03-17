import * as telegram from '../modules/telegram'
import * as yinwang from '../reptiles/yinwang'
import { readHistorySync, writeHistorySync } from '../modules/history'
import { getBeijingDateStamp } from '../modules/localization'

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

        let history_queue = readHistorySync(blogHistoryFile)

        for (let i = 0; i < blogList.length; i++) {
            let blog = blogList[i]

            if (history_queue.indexOf(blog.title) != -1) {
                continue
            }

            let text = `${blog.title}\n${blog.url}`
            let mes: telegram.Message = {
                chat_id: chat_id.me,
                text: text,
                parse_mode: telegram.MessageMode.markdown
            }

            telegram.sendMessage(token.yinwang, mes, (err: Error, res) => {
                if (err)
                    console.error(`yinwang#sendMessage fail: ${blog.title}`)
            })

            if (history_queue.length >= maxBlogHistory) {
                let mail = new telegram.Mail('yinwang-to-telegram', 'getBlogs', `Blog历史已满:《${blog.title}》无法存储`, '需设置更大的 maxBlogHistory')
                telegram.sendMail(mail)
            }
            else {
                history_queue.push(blog.title)
            }
        }

        writeHistorySync(blogHistoryFile, history_queue)
        console.log(`${getBeijingDateStamp()} Finish Script: yinwang-to-telegram `)
    })
}