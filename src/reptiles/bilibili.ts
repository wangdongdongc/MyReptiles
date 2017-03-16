import * as superagent from 'superagent'

import { Mail, sendMail } from '../modules/telegram'
import { token } from '../assets/auth_telegram';
import { http_header, bilibili_feed_url } from '../assets/auth_bilibili';
import { getBeijingDateStamp } from '../modules/localization';

/**
 * Bilibili Feed Interface
 */
export interface BBFeed {
    author: string
    title: string
    /**brief instruction */
    description: string
    /**cover image url */
    pic: string
    /**link to video */
    link: string
}

/**
 * 将 bilibili 动态转换成 HTML格式的字符串
 * @param {BBFeed} feed bilibili 动态
 */
export function convertBBFeedToHTML(feed: BBFeed): string {
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
export function getRecentFeeds(callback: (err: Error, list: BBFeed[]) => void) {
    superagent
        .get(bilibili_feed_url)
        .set(http_header)
        .end((err, res) => {
            try {
                let raw_data: string = err.rawResponse
                let data: string = raw_data.substring('jQuery172043578431582043686_1489669341318('.length, raw_data.length-1)

                let json = JSON.parse(data)

                let raw_feeds: Object[] = json.data.feeds
                let feeds: BBFeed[] = []

                for (let i = 0; i < raw_feeds.length; i++) {
                    let rawFeed = raw_feeds[i]
                    let newFeed: BBFeed
                    switch (<BBFeedType>rawFeed['type']) {
                        case BBFeedType.UP:
                        case BBFeedType.Bangumi:
                            newFeed = {
                                author: rawFeed['addition']['author'],
                                title: rawFeed['addition']['title'],
                                description: rawFeed['addition']['description'],
                                pic: rawFeed['addition']['pic'],
                                link: rawFeed['addition']['link']
                            }
                            feeds.push(newFeed)
                            break
                        default:
                            sendMail(
                                new Mail('Bilibili Feed', `未识别的Feed类型: ${rawFeed['type']}`, '', getBeijingDateStamp()),
                                token.mail
                            )
                            continue
                    }
                }

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
    //node bilibili.js
    getRecentFeeds((err, list) => {
        console.log(`get ${list.length} bilibili feeds`)
        console.log(`END`)
    })
}