import * as superagent from 'superagent'
import * as cheerio from 'cheerio'

import {Mail, sendMail} from '../modules/telegram'

import {http_header} from '../assets/auth_tsdm'

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

const tsdmURL = "http://www.tsdm.me/"

function getChildCheerioFromNode(parentNode: CheerioStatic, selector: string) {
    let downContent = cheerio.load(parentNode.html())(selector)
    return cheerio.load(downContent.html())
}

/**
 * 获取天使动漫#轻文社上最新的小说(贴子)
 * 
 * @export
 * @param {(err: Error, list: LightNovel[])=>void} callback - callback function
 */
export function getRecentNovels(callback: (err: Error, list: LightNovel[])=>void) {
    superagent
        .get(`${tsdmURL}forum.php?mod=forumdisplay&fid=327&mobile=yes`)
        .set(http_header)
        .end((err, res) => {
            if (err) {
                callback(err, null)
                return
            }
            if (res.text.indexOf('sssoa') == -1 ||
                res.text.indexOf('轻文社') == -1) {
                const time = new Date()
                const mail: Mail = new Mail('天使动漫', 'Error', '未获取正确的HTML', `${time.toString()}`)
                sendMail(mail)
                callback(new Error('天使动漫: 未获取正确的HTML'), null)
            } 
            else {
                let novel_list: LightNovel[] = [];

                // 解析 HTML 获取数据
                let $ = cheerio.load(res.text, {
                    normalizeWhitespace: true,
                    xmlMode: true
                })
                // List
                let list = $('div.bm_c')

                for (let i = 0; i < list.length; i++) {
                    let item = list[i]
                
                    let node = cheerio.load(item)
                    let items = node('a')

                    let novel: LightNovel = {
                        title: node('a').text().trim(),
                        link: node('a').attr('href').trim(),
                        tag: ''
                    }

                    if (!novel.link.startsWith(tsdmURL)) {
                        novel.link = `${tsdmURL}${novel.link}`
                    }

                    novel_list.push(novel)
                }

                callback(null, novel_list)
            }
        })
}

/**
 * @debug
 */
if (process.argv.length >= 2 &&
    process.argv[1].indexOf('build/reptiles/tsdm.js') != -1) {
    // getRecentNovels((err, list) => {
    //     console.log(`END`)
    // })
    TEST()
}
function TEST() {
    let ls = []
    for(let i = 0; i < 10; i++) {
        ls.push(i)
    }

    console.log('BEGIN')
    ls.forEach((item) => {
        setTimeout(function() {
            console.log('ITEM')
        }, 2000);
    })
    console.log(`END`)
}