import * as superagent from 'superagent'
import * as cheerio from 'cheerio'

import { Mail, sendMail } from '../modules/telegram'

import { http_header } from '../assets/auth_tsdm'

/**
 * LightNovel interface for tsdm#getRecentNovels()=>LightNovel[]
 *
 * @export
 * @interface LightNovel
 */
export interface LightNovel {
    title: string
    link: string
    tag: string
}

const TsdmURL = 'http://www.tsdm.me/'
const Sections = [
    'forum.php?mod=forumdisplay&fid=327&mobile=yes', // 轻文社
    'forum.php?mod=forumdisplay&fid=182&mobile=yes'  // 魔法学院的地下迷宫
]


/**
 * 获取天使动漫#轻文社上最新的小说(贴子)
 */
export function getRecentNovels(): Promise<LightNovel[]> {
    return new Promise<LightNovel[]>((resolve, reject) => {
        Sections.forEach((section) => {
            superagent.get(`${TsdmURL}${section}`).set(http_header).end((err, res) => {
                if (err) {
                    reject(err)
                    return
                }
                if (res.text.indexOf('sssoa') == -1 ||
                    res.text.indexOf('轻小说讨论区') == -1) {
                    const time = new Date()
                    const mail: Mail = new Mail('天使动漫', 'Error', '未获取正确的HTML', `${time.toString()}`)
                    sendMail(mail)
                    reject(new Error('天使动漫: 未获取正确的HTML'))
                    return
                }
                else {
                    // 解析 HTML 获取数据
                    let $ = cheerio.load(res.text, {
                        normalizeWhitespace: true,
                        xmlMode: true
                    })

                    let list = $('div.bm_c')

                    let novel_list: LightNovel[] = []

                    for (let i = 0; i < list.length; i++) {
                        let item = list[i]

                        let node = cheerio.load(item)

                        let novel: LightNovel = {
                            title: node('a').text().trim(),
                            link: node('a').attr('href').trim(),
                            tag: ''
                        }

                        if (!novel.link.startsWith(TsdmURL)) {
                            if (node('a').length === 3) {
                                novel.link = node('a')[1].attribs['href']
                            }
                            novel.link = `${TsdmURL}${novel.link}`
                        }

                        novel_list.push(novel)
                    }
                    resolve(novel_list)
                }
            }) // end superagent
        }) // end Sections.forEach
    })

}

/**
 * @debug
 */
if (process.argv.length >= 2 &&
    process.argv[1].indexOf('build/reptiles/tsdm.js') != -1) {
    getRecentNovels().then((list) => {
        list.forEach((novel) => {
            console.log(novel.title)
        })
    })
}