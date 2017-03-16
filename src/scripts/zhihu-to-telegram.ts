import * as _ from 'underscore'

import { readHistorySync, writeHistorySync } from '../modules/history'
import { Mode, Message, sendMessage } from '../modules/telegram'
import { User, Activity, getRecentActivities } from '../reptiles/zhihu'
import { getBeijingDateStamp } from '../modules/localization'

import { token, chat_id } from '../assets/auth_telegram'
import { followingUsers } from '../assets/zhihu'

const historyFile = 'zhihu-to-telegram.json'
const maxHistory = 100

/**
 * 任务：将所有关注用户的新动态发送至相应 Bot
 */
export function task() {
    //每隔 1s 进行一次爬取
    let intervalTime = 1000 /* ms */
    let i = 0;
    let handler = setInterval(() => {
        zhihu_to_telegram(followingUsers[i])
        i = i + 1
        if (i >= followingUsers.length)
            clearInterval(handler)
    }, intervalTime)
    console.log(`${getBeijingDateStamp()} Finish Script: zhihu-to-telegram`)
}

/**
 * 获取单个用户的动态发送至 telegram
 *  note: 同时获取过多知乎用户动态会失败
 */
function zhihu_to_telegram(user: User) {
    getRecentActivities(user, (err, activities: Activity[]) => {
        if (err) {
            console.log(`#getRecentActivities fail: ${err.message}`)
        } else {
            // load history
            let history_queue = readHistorySync(user.historyFile)
            _.forEach(activities, (act: Activity) => {
                let actID: string = `${act.authorName}:${act.title}`
                if (_.contains(history_queue, actID) ||
                    act.meta == '关注了问题') {
                    // ingore
                }
                else {
                    // build message
                    let text = `*${user.name}* _${act.meta}_\n*${act.title}*\n${act.link}\n*${act.authorName}*\n${act.content}`
                    let mes: Message = {
                        chat_id: chat_id.me,
                        text: text,
                        parse_mode: Mode.markdown
                    }

                    sendMessage(token.zhihu, mes, (err, res) => {
                        // error report
                        if (err) {
                            console.log(`#sendMessage fail: 知乎 @${user.name} ${act.meta} ${act.authorName} ${act.title}`);
                        }
                    })

                    // save history
                    if (history_queue.length >= maxHistory)
                        history_queue.shift()
                    history_queue.push(actID)
                }
            }) // end for each activity
            writeHistorySync(user.historyFile, history_queue)
        }
    })
}