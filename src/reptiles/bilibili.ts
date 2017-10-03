import * as superagent from 'superagent'

import { send_mail_to_telegram } from '../modules/rabbitmq-telegram'
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
    type: BBFeedType
}

/**
 * 将 bilibili 动态转换成 HTML格式的字符串
 * @param {BBFeed} feed bilibili 动态
 */
export function convertBBFeedToHTML(feed: IBBFeed): string {
    return `<i>${feed.author}\n</i><i>${feed.title}</i>`
}

export enum BBFeedType {
    UP = 0,
    Bangumi = 1
}

/**
 * 获取 Bilibili 最新动态
 */
export function getRecentFeeds(): Promise<IBBFeed[]> {
    return new Promise<IBBFeed[]>((resolve) => {
        superagent.get(bilibili_feed_url).set(http_header).end((err, res) => {
            try {
                let data = res.text

                let json = JSON.parse(data)

                let raw_feeds: Object[] = json.data
                let feeds: IBBFeed[] = []

                raw_feeds.forEach((feed) => {
                    switch (<BBFeedType>feed['type']) {
                    case BBFeedType.UP:
                        feeds.push({
                            type: <BBFeedType>feed['type'],
                            author: feed['archive']['owner']['name'],
                            title: feed['archive']['title'],
                            description: feed['archive']['desc'],
                            pic: feed['archive']['pic'],
                            link: `https://www.bilibili.com/video/av${feed['id']}/`
                        })
                        return
                    case BBFeedType.Bangumi:
                        feeds.push({
                            type: <BBFeedType>feed['type'],
                            author: 'Bilibili',
                            title: `《${feed['bangumi']['title']}》 第${feed['bangumi']['new_ep']['index']}集`,
                            description: feed['bangumi']['new_ep']['index_title'],
                            pic: feed['bangumi']['cover'],
                            link: `https://bangumi.bilibili.com/anime/${feed['id']}/play`
                        })
                        return
                    default:
                        send_mail_to_telegram('reptile: bilibili', `未识别的Feed类型: ${feed['type']}`, `${JSON.stringify(feed)}\n${getBeijingDateStamp()}`)
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
        list.forEach((item) => {
            console.log(item)
        })
        console.log(`END`)
    })
}