import { readHistorySync, writeHistorySync } from '../../modules/history'
import { Mode, Message, sendMessage } from '../../modules/telegram'
import { token, chat_id } from '../../assets/auth_telegram'
import { TYPE, User, Activity, getRecentActivities } from '../../reptiles/zhihu'
import { getBeijingDateStamp } from '../../modules/localization';
import * as _ from 'underscore'

const historyFile = 'zhihu-to-telegram.json'
const maxHistory = 100

/**
 * 关注的动态
 *  同时发送过多请求会出现 Too Many Requests 错误
 */
const followingUsers: User[] = [
    {
        name: 'vczh',
        activity_page: 'https://www.zhihu.com/people/excited-vczh',
        identifier: 'vczh',
        historyFile: 'zhihu-to-telegram--vczh.json'
    },
    {
        name: '尤雨溪',
        activity_page: 'https://www.zhihu.com/people/evanyou',
        identifier: '尤雨溪',
        historyFile: 'zhihu-to-telegram--evanyou.json'
    },
    {
        name: '陈萌萌',
        activity_page: 'https://www.zhihu.com/people/jjmoe',
        identifier: '陈萌萌',
        historyFile: 'zhihu-to-telegram--jjmoe.json'
    },
    {
        name: '徐飞',
        activity_page: 'https://www.zhihu.com/people/sharpmaster',
        identifier: '徐飞',
        historyFile: 'zhihu-to-telegram--sharpmaster.json'
    },
    {
        name: 'Milo Yip',
        activity_page: 'https://www.zhihu.com/people/miloyip',
        identifier: 'Milo Yip',
        historyFile: 'zhihu-to-telegram--miloyip.json'
    },
    {
        name: '云舒',
        activity_page: 'https://www.zhihu.com/people/yunshu',
        identifier: '云舒',
        historyFile: 'zhihu-to-telegram--yunshu.json'
    },
    {
        name: 'RednaxelaFX',
        activity_page: 'https://www.zhihu.com/people/rednaxelafx',
        identifier: 'RednaxelaFX',
        historyFile: 'zhihu-to-telegram--yunshu.json'
    },
    {
        name: 'Sean Ye',
        activity_page: 'https://www.zhihu.com/people/sean-yenan',
        identifier: 'Sean Ye',
        historyFile: 'zhihu_to_telegram--seanye.json'
    },
    {   //2017/1/30
        name: 'tombkeeper',
        activity_page: 'https://www.zhihu.com/people/tombkeeper',
        identifier: 'tombkeeper',
        historyFile: 'zhihu_to_telegram--tombkeeper.json'
    },
    {   //2017/1/30-18:47
        name: '陈炜',
        activity_page: 'https://www.zhihu.com/people/ipondering',
        identifier: '陈炜',
        historyFile: 'zhihu_to_telegram--chenwei.json'
    }
]

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
                } else {
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