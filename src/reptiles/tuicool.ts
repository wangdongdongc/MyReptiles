import * as superagent from 'superagent'
import * as cheerio from 'cheerio'

import { Mail, sendMail } from '../modules/telegram'

import { http_header, name } from '../assets/auth_tuicool'

/**
 * Article interface for tuicool#getRecentArticles()=>Article[]
 *
 * @export
 * @interface {Article}
 */
export interface Article {
    'title': string
    'cut': string
    'thumb': string
    'link': string
}

/**
 * 获取推酷上面最新的文章
 * @export
 */
export function getRecentArticles(): Promise<Article[]> {
    return new Promise<Article[]>((resolve, reject) => {
        superagent.get('http://www.tuicool.com').set(http_header).end((err, res) => {
            if (err) {
                reject(err)
                return
            }
            if (res.text.indexOf(name) == -1) {
                const time = new Date()
                const mail: Mail = new Mail('推酷', 'Error', '未获取正确的HTML', `${time.toString()}`)
                sendMail(mail)
                // callback(new Error('推酷: 未获取正确的HTML'), null)
                reject(new Error('推酷: 未获取正确的HTML'))
            }
            else {
                let article_list: Article[] = []
                // 解析 HTML 获取数据
                let $ = cheerio.load(res.text) // res.text is HTML
                let list = $('.single_fake')

                for (let i = 0; i < list.length; i++) {
                    let node = list[i]

                    let cnode = cheerio.load(node)
                    let article: Article = {
                        'title': cnode('a.article-list-title').text().trim(),
                        'cut': cnode('div.article_cut').text().trim(),
                        'thumb': cnode('div.article_thumb').text().trim(),
                        'link': `http://tuicool.com${cnode('a.article-list-title').attr('href').trim()}`
                    }
                    article_list.push(article)
                }

                resolve(article_list)
            }
        }) // end superagent
    }) // end return
}