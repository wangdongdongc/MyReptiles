import * as superagent from 'superagent'

import { send_mail_to_telegram } from '../modules/rabbitmq-telegram'
import { http_header, bilibili_feed_url, bilibili_jquery_token } from '../assets/auth_bilibili'
import { getBeijingDateStamp } from '../modules/localization'

/**
 * Bilibili Feed Interface
 */
interface IBBFeed {
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
 */
export function getRecentFeeds(): Promise<IBBFeed[]> {
    return new Promise<IBBFeed[]>((resolve) => {
        superagent.get(bilibili_feed_url).set(http_header).end((err, res) => {
            try {
                if (!(err instanceof SyntaxError)) {
                    send_mail_to_telegram('reptile: bilibili', '不正确的异常', err)
                    return
                }

                let raw_data: string = (<any>err).rawResponse

                let data = raw_data.substring(`jQuery${bilibili_jquery_token}(`.length, raw_data.length - 1)

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
                            send_mail_to_telegram('reptile: bilibili', `未识别的Feed类型: ${rawFeed['type']}`, `${JSON.stringify(rawFeed)}\n${getBeijingDateStamp()}`)
                            return
                    }
                })

                resolve(feeds)

            } catch (error) {
                send_mail_to_telegram('reptile: bilibili', 'Error', `${error}\n${getBeijingDateStamp()}`)
                return
            }
        })
    })
}


/**
 * @debug
 * 仅当本文件对应的 JS 文件被 node 直接执行使, 该段代码生效
 */
if (process.argv.length >= 2 &&
    process.argv[1].indexOf('build/reptiles/bilibili.js') != -1) {
    getRecentFeeds().then((list) => {
        console.log(`get ${list.length} bilibili feeds`)
        console.log(`END`)
    })
}