import * as zhihu from '../reptiles/zhihu'
import {History} from '../modules/mysql'
import {sendMessageToRabbitMQ} from '../modules/rabbitmq-telegram'

import {token, chat_id} from '../assets/auth_telegram'
import {followingUsers} from '../assets/zhihu'


/**
 * 任务：将所有关注用户的新动态发送至相应 Bot
 */
export function task() {
    // 每隔 1s 进行爬取一个用户的动态
    let intervalTime = 1000
    /* ms */
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
    zhihu.getRecentActivities(user).then((activities) => {

        activities.map(act => {
            // 为每个条目构造标识符
            (<ZhihuActivityWithIdentifier> act).identifier = `${act.authorName}:${act.title}`
            return act as ZhihuActivityWithIdentifier
        }).forEach(act => {

            const historyId: History.Identifier = {
                type: History.Type.ZHIHU,
                content: act.identifier
            }

            History.contain(historyId).then(isContain => {
                if (!isContain && act.meta !== '关注了问题') {
                    History.insert(historyId).then(_ => {
                        let text = `*${user.name}* _${act.meta}_\n*${act.title}*\n${act.link}\n*${act.authorName}*\n${act.content}`
                        sendMessageToRabbitMQ(token.zhihu, chat_id.me, text, historyId)
                    })
                }
            })
        })

    }).catch((err) => {
        console.error(`知乎#getRecentActivities(${user.name}) fail: ${err.message}`)
    })
}