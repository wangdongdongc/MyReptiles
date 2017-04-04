import * as superagent from 'superagent'
import * as cheerio from 'cheerio'

import { send_mail_to_telegram } from '../modules/rabbitmq-telegram'
import { getBeijingDateStamp } from '../modules/localization'

/**
 * Novel interface for biquge#getRecentChapters(Novel)
 *
 * @export
 * @interface Novel
 */
export interface Novel {
    'name': string
    'url': string
    'history': {
        'filename': string
        'maxHistory': number
    }
}

export interface NovelInfo {
    name: string
    url: string
    historyFile: string
}

/**
 * Chapter interface for biquge#getRecentChapters()=>Chapter[]
 *
 * @export
 * @interface Chapter
 */
export interface Chapter {
    'title': string
    'link': string
}

/**
 * 获取笔趣阁上指定小说的最近更新章节
 *
 * @export
 * @param {Novel} novel
 * @param {function(Error, Chapters)} callback
 */
export function getRecentChapters(novel: Novel): Promise<Chapter[]> {
    return new Promise<Chapter[]>((resolve, reject) => {
        superagent.get(novel.url).end((err, res) => {
            if (err) {
                reject(err)
                return
            }
            if (res.text.indexOf(novel.name) == -1) {
                send_mail_to_telegram('reptile: 笔趣阁', `未获取正确的HTML`, `《${novel.name}》\n${getBeijingDateStamp()}`)
                reject(new Error('笔趣阁: 未获取正确的HTML'))
                return
            }
            else {
                let chapter_list: Chapter[] = []

                let $ = cheerio.load(res.text)
                let list = cheerio.load($('ul.chapter').html())('li')

                for (let i = 0; i < list.length; i++) {
                    let item = list[i]

                    let node = cheerio.load(item)
                    let chapter: Chapter = {
                        'title': node('a').text().trim(),
                        'link': node('a').attr('href').trim()
                    }

                    chapter.link = `http://m.biquge.com${chapter.link}`
                    chapter_list.push(chapter)
                }

                resolve(chapter_list)
            }
        })
    })
}