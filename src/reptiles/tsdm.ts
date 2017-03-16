import * as superagent from 'superagent'
import * as cheerio from 'cheerio'
import * as _ from 'underscore'

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

/**
 * 获取天使动漫#轻文社上最新的小说(贴子)
 * 
 * @export
 * @param {(err: Error, list: LightNovel[])=>void} callback - callback function
 */
export function getRecentNovels(callback: (err: Error, list: LightNovel[])=>void) {
    superagent
        .get(`${tsdmURL}forum.php?mod=forumdisplay&fid=327`)
        .set(http_header)
        .end((err, res) => {
            if (err) {
                callback(err, null)
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
                let $ = cheerio.load(res.text)
                // List
                let list = $('tbody.tsdm_normalthread')
                
                _.forEach(list, (item) => {
                    // Item
                    let node = cheerio.load(item)
                    let novel: LightNovel = {
                        title: node('a.xst').text().trim(),
                        link: node('a.xst').attr('href').trim(),
                        tag: node('a.xi1').text().trim()
                    }

                    if (!novel.link.startsWith(tsdmURL)) {
                        novel.link = `${tsdmURL}${novel.link}`
                    }
                    novel_list.push(novel)
                })
                callback(null, novel_list)
            }
        })
}