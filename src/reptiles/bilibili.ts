import * as superagent from 'superagent'

import { Mail, sendMail } from '../modules/telegram'
import { send_mail_to_telegram } from '../modules/rabbitmq-telegram'
import { token } from '../assets/auth_telegram'
import { http_header, bilibili_feed_url } from '../assets/auth_bilibili'
import { getBeijingDateStamp } from '../modules/localization'

/**
 * Bilibili Feed Interface
 */
export interface IBBFeed {
    author: string
    title: string
    description: string
    pic: string
    link: string
}

/**
 * 将 bilibili 动态转换成 HTML格式的字符串
 * @param {BBFeed} feed bilibili 动态
 */
export function convertBBFeedToHTML(feed: IBBFeed): string {
    return `<i>${feed.author}\n</i><i>${feed.title}</i>`
}

enum BBFeedType {
    UP = 1,
    Bangumi = 3
}

/**
 * 获取 Bilibili 最新动态
 * @param {function} callback (err: Error, list: BBFeed[]) => void
 */
export function getRecentFeeds(callback: (err: Error, list: IBBFeed[]) => void) {
    superagent
        .get(bilibili_feed_url)
        .set(http_header)
        .end((err, res) => {
            try {
                if (!(err instanceof SyntaxError)) {
                    send_mail_to_telegram('reptile: bilibili', '不正确的异常', err)
                    return
                }

                let raw_data: string = (<any>err).rawResponse

                let data = raw_data.substring('jQuery172043578431582043686_1489669341318('.length, raw_data.length - 1)

                let json = JSON.parse(data)

                let raw_feeds: Object[] = json.data.feeds
                let feeds: IBBFeed[] = []

                raw_feeds.forEach((rawFeed) => {
                    switch (<BBFeedType>rawFeed['type']) {
                        case BBFeedType.UP:
                        case BBFeedType.Bangumi:
                            feeds.push({
                                author: rawFeed['addition']['author'],
                                title: rawFeed['addition']['title'],
                                description: rawFeed['addition']['description'],
                                pic: rawFeed['addition']['pic'],
                                link: rawFeed['addition']['link']
                            })
                            return
                        default:
                            sendMail(
                                new Mail('Bilibili Feed', `未识别的Feed类型: ${rawFeed['type']}`, '', getBeijingDateStamp()),
                                token.mail
                            )
                            return
                    }
                })

                callback(null, feeds)

            } catch (error) {
                sendMail(
                    new Mail('Bilibili Feed', 'Error', error, getBeijingDateStamp()),
                    token.mail)
                return
            }
        })
}


/**
 * @debug
 * 仅当本文件对应的 JS 文件被 node 直接执行使, 该段代码生效
 */
if (process.argv.length >= 2 &&
    process.argv[1].indexOf('build/reptiles/bilibili.js') != -1) {
    // node bilibili.js
    getRecentFeeds((err, list) => {
        console.log(`get ${list.length} bilibili feeds`)
        console.log(`END`)
    })
}