import * as _ from 'underscore'

import { readHistorySync, writeHistorySync } from '../modules/history'
import { Mode, Message, sendMessage, Mail, sendMail } from '../modules/telegram'
import { Blog, getBlogs, Tweet, getTweets } from '../reptiles/yinwang'
import { getBeijingDateStamp } from '../modules/localization';

import { token, chat_id } from '../assets/auth_telegram'

const blogHistory = 'yinwang-to-telegram--blog.json'
const tweetHistory = 'yinwang-to-telegram--tweet.json'
const maxBlogHistory = 300
const maxTweetHistory = 1000

/**
 * 任务：将王垠的新博文发送至相应 Bot
 */
export function task() {
    getBlogs((err, blogList: Blog[]) => {
        if (err) {
            console.log(`yiwang#getBlogs fail: ${err.message}`)
        }
        let blogHistoryQueue = readHistorySync(blogHistory)
        _.forEach(blogList, (blog: Blog) => {
            if (_.contains(blogHistoryQueue, blog.title)) {
                //ignore
            } 
            else {
                let text = `${blog.title}\n${blog.url}`
                let mes: Message = {
                    chat_id: chat_id.me,
                    text: text,
                    parse_mode: Mode.markdown
                }

                sendMessage(token.yinwang, mes, (err: Error, res) => {
                    if (err) { 
                        console.log(`telegram#sendMessage fail: ${err.message}`) 
                    }
                })

                if (blogHistoryQueue.length >= maxBlogHistory) {
                    let mail = new Mail('yinwang-to-telegram', 'getBlogs', `Blog历史已满:《${blog.title}》无法存储`, '需设置更大的 maxBlogHistory')
                    sendMail(mail)
                } 
                else {
                    blogHistoryQueue.push(blog.title)
                }
            }
        })
        writeHistorySync(blogHistory, blogHistoryQueue)
        console.log(`${getBeijingDateStamp()} Finish Script: yinwang-to-telegram `)
    })
}