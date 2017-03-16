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
}

/**
 * 获取单个用户的动态发送至 telegram
 *  note: 同时获取过多知乎用户动态会失败
 */
function zhihu_to_telegram(user: User) {
    getRecentActivities(user, (err, activities: Activity[]) => {
        if (err) {
            console.error(`知乎#getRecentActivities fail: ${err.message}`)
            return
        }

        let history_queue = readHistorySync(user.historyFile)

        for(let i = 0; i < activities.length; i++) {
            let act = activities[i]
            let actID: string = `${act.authorName}:${act.title}`

            if (history_queue.indexOf(actID) != -1 ||
                act.meta == '关注了问题') {
                continue
            }

            // build message
            let text = `*${user.name}* _${act.meta}_\n*${act.title}*\n${act.link}\n*${act.authorName}*\n${act.content}`
            let mes: Message = {
                chat_id: chat_id.me,
                text: text,
                parse_mode: Mode.markdown
            }

            sendMessage(token.zhihu, mes, (err, res) => {
                if (err)
                    console.error(`知乎#sendMessage fail: @${user.name} ${act.meta} ${act.authorName} ${act.title}`);
            })

            if (history_queue.length >= maxHistory)
                history_queue.shift()
            history_queue.push(actID)
        }

        writeHistorySync(user.historyFile, history_queue)
    })
    console.log(`${getBeijingDateStamp()} Finish Script: zhihu-to-telegram @${user.name}`)
}