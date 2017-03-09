import {readHistorySync, writeHistorySync} from '../../modules/history'
import {Mode, Message, sendMessage, Mail, sendMail} from '../../modules/telegram'
import {token, chat_id} from '../../assets/auth_telegram'
import {Blog, getBlogs, Tweet, getTweets} from '../../reptiles/yinwang'
import * as _ from 'underscore'

const blogHistory = 'yinwang-to-telegram--blog.json'
const tweetHistory = 'yinwang-to-telegram--tweet.json'
const maxBlogHistory = 300
const maxTweetHistory = 1000

export function task() {
    getBlogs((err, blogList: Blog[]) => {
        if (err) {
            console.log(`yiwang#getBlogs fail: ${err.message}`)
        }
        let blogHistoryQueue = readHistorySync(blogHistory)
        _.forEach(blogList, (blog: Blog) => {
            if (_.contains(blogHistoryQueue, blog.title)) {
                //
            } else {
                let text = `${blog.title}\n${blog.url}`
                let mes: Message = {
                    chat_id: chat_id.me,
                    text: text,
                    parse_mode: Mode.markdown
                }
                sendMessage(token.yinwang, mes, (err: Error, res) => {
                    if (err) { console.log(`telegram#sendMessage fail: ${err.message}`) }
                })
                if (blogHistoryQueue.length >= maxBlogHistory) {
                    let mail = new Mail('yinwang-to-telegram', 'getBlogs', `Blog历史已满:《${blog.title}》无法存储`, '需设置更大的 maxBlogHistory')
                    sendMail(mail)
                } else {
                    blogHistoryQueue.push(blog.title)
                }
            }
        })
        writeHistorySync(blogHistory, blogHistoryQueue)
        console.log(`Finish Script: yinwang-to-telegram (crontab)`)
    })
}