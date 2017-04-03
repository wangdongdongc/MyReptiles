import * as zhihu from '../reptiles/zhihu'
import { HistoryFile } from '../modules/history'
// import { getBeijingDateStamp } from '../modules/localization'
import { send_message_to_telegram } from '../modules/rabbitmq-telegram'

import { token, chat_id } from '../assets/auth_telegram'
import { followingUsers } from '../assets/zhihu'

const maxHistory = 100

/**
 * 任务：将所有关注用户的新动态发送至相应 Bot
 */
export function task() {
    // 每隔 1s 进行一次爬取
    let intervalTime = 1000 /* ms */
    let i = 0
    let handler = setInterval(() => {
        zhihu_to_telegram(followingUsers[i])
        i = i + 1
        if (i >= followingUsers.length)
            clearInterval(handler)
    }, intervalTime)
}


interface ZhihuActivityWithIdentifier extends zhihu.Activity {
    identifier: string
}

/**
 * 获取单个用户的动态发送至 telegram
 *  note: 同时获取过多知乎用户动态会失败
 */
function zhihu_to_telegram(user: zhihu.User) {
    zhihu.getRecentActivities(user, (err, activities) => {
        if (err) {
            console.error(`知乎#getRecentActivities(${user.name}) fail: ${err.message}`)
            return
        }

        let history = new HistoryFile(user.historyFile, maxHistory)

        activities
            .map((act) => {
                // 为每个动态条目添加标识符
                (<ZhihuActivityWithIdentifier>act).identifier = `${act.authorName}:${act.title}`
                return act as ZhihuActivityWithIdentifier
            })
            .filter((act) => {
                return !history.contain(act.identifier) && act.meta !== '关注了问题'
            })
            .forEach((act) => {
                let text = `*${user.name}* _${act.meta}_\n*${act.title}*\n${act.link}\n*${act.authorName}*\n${act.content}`

                send_message_to_telegram(token.zhihu, chat_id.me, text)

                history.push(act.identifier)
            })

        history.save()
    })
    // console.log(`${getBeijingDateStamp()} Finish Script: zhihu-to-telegram @${user.name}`)
}