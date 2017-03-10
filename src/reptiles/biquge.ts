import * as superagent from 'superagent'
import * as cheerio from 'cheerio'
import * as _ from 'underscore'
import {Mail, sendMail} from '../modules/telegram'

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
 * @param {(err:Error, list: Chapter[])=>void} callback
 */
export function getRecentChapters(novel: Novel, callback: (err:Error, list: Chapter[])=>void) {
    superagent
        .get(novel.url)
        .end((err, res) => {
            if (err) {
                callback(err, null)
            }
            if (res.text.indexOf(novel.name) == -1) {
                const time = new Date()
                const mail: Mail = new Mail('笔趣阁', 'Error', `未获取正确的HTML`, `《${novel.name}》\n${time.toString()}`)
                sendMail(mail)
                callback(new Error('笔趣阁: 未获取正确的HTML'), null)
            } 
            else {
                let chapter_list: Chapter[] = []
                // 解析 HTML 获取数据
                let $ = cheerio.load(res.text)
                // 获取 List
                let list = cheerio.load($('ul.chapter').html())('li')
                _.forEach(list, (item) => {
                    // 获取 node
                    let node = cheerio.load(item)
                    // 获取 item 数据
                    let chapter: Chapter = {
                        'title': node('a').text().trim(),
                        'link': node('a').attr('href').trim()
                    }
                    chapter.link = `http://m.biquge.com${chapter.link}`
                    chapter_list.push(chapter)
                })
                callback(null, chapter_list)
            }
        })
}