import * as assert from 'assert'

import * as superagent from 'superagent'
import * as cheerio from 'cheerio'
import * as _ from 'underscore'
import {Mail, sendMail} from '../modules/telegram'
import {http_header} from '../assets/auth_zhihu'

export const TYPE = {
    '赞了X中文章': new RegExp('赞了\ .+\ 中的文章'),
    '赞同了回答': new RegExp('赞同了回答'),
    '回答了问题': new RegExp('回答了问题'),
    '赞了文章': new RegExp('赞了文章'),
    '关注了问题': new RegExp('关注了问题')
    //发表了文章
}

/**
 * User interface for zhihu#getRecentActivities(User)
 * 
 * @export
 * @interface User
 */
export interface User {
    'name': string
    'activity_page': string
    'identifier': string
    'historyFile': string
}

/**
 * Activity interface for zhihu#getRecentActivities()=>Activity[]
 * 
 * @export
 * @interface Activity
 */
export interface Activity {
    meta: string
    title: string
    link: string
    authorName: string
    content: string
}

/**
 * 去除字符串中的 "\n" 符号
 * 
 * @param {string} str - 可能包含"\n"的字符串
 * @returns - 不包含"\n"的字符串
 */
function removeLineBreak (str: string) {
    while(str.lastIndexOf('\n') != -1) {
        str = str.substring(0, str.lastIndexOf('\n')) +
                    str.substring(str.lastIndexOf('\n') + 1, str.length)
    }
    return str
}

function getChildCheerioFromNode(parentNode: CheerioStatic, selector: string) {
    const downContent = cheerio.load(parentNode.html())(selector)
    return cheerio.load(downContent.html())
}

const zhihuPrefix = 'http://zhihu.com'

/**
 * 获取知乎用户最近动态
 * 
 * @export
 * @param {User} user
 * @param {(err: Error, list: Activity[])=>void} callback
 */
export function getRecentActivities(user: User, callback: (err: Error, list: Activity[])=>void) {
    superagent
    .get(user.activity_page)
    .set(http_header)
    .end((err, res) => {
        if (err) callback(err, null)
        // 验证页面是否正确
        if (res.text.indexOf(user.identifier) == -1) {
            const time = new Date()
            const mail: Mail = new Mail(`知乎动态@${user.name}`, 'Error', '未获取正确的HTML', `${time.toString()}`)
            sendMail(mail)
            callback(new Error(`知乎动态 @${user.name}: 未获取正确的HTML`), null)
        } else {
            var act_list: Activity[] = []
            // 解析 HTML 获取数据
            var $ = cheerio.load(res.text)
            var list = $('div.zm-profile-section-item.zm-item.clearfix')
            _.forEach(list, (item) => {
                var node: CheerioStatic = cheerio.load(item)
                // 获取 item 数据
                var act: Activity = {
                    meta: node('div.zm-profile-activity-page-item-main').text(),
                    title: null,     // Todo
                    link: null,     // Todo
                    authorName: null, // Todo
                    content: node('div.zh-summary.summary.clearfix').text()     // Todo
                }
                act.meta = removeLineBreak(act.meta)
                act.content = removeLineBreak(act.content)

                // 处理 meta (RegExp)
                if (TYPE.赞了X中文章.exec(act.meta) != null)
                {
                    const old_meta = act.meta
                    const result = TYPE.赞了X中文章.exec(act.meta)
                    act.meta = result[0]
                    act.title = old_meta.substring(result.index + result[0].length, old_meta.length)
                    node = getChildCheerioFromNode(node, 'div.zm-item-feed.zm-item-post')
                    act.link = node('link').attr('href').trim()
                    act.authorName = node('a.author-link').text().trim()
                } 
                else if (TYPE.赞了文章.exec(act.meta) != null) 
                {
                    const old_meta = act.meta
                    const result = TYPE.赞了文章.exec(act.meta)
                    act.meta = result[0]
                    act.title = old_meta.substring(result.index + result[0].length, old_meta.length)
                    node = getChildCheerioFromNode(node, 'div.zm-item-feed.zm-item-post')
                    act.link =  node('link').attr('href').trim()
                    act.authorName = node('a.author-link').text().trim()
                } 
                else if (TYPE.赞同了回答.exec(act.meta) != null) 
                {
                    const old_meta = act.meta
                    const result = TYPE.赞同了回答.exec(act.meta)
                    act.meta = result[0]
                    act.title = old_meta.substring(result.index + result[0].length, old_meta.length)
                    node = cheerio.load(node.html())
                    act.authorName = node('div.zm-item-rich-text').attr('data-author-name').trim()
                    act.link = zhihuPrefix + node('div.zm-item-rich-text').attr('data-entry-url').trim()
                } 
                else if (TYPE.回答了问题.exec(act.meta) != null) 
                {
                    const old_meta = act.meta
                    const result = TYPE.回答了问题.exec(act.meta)
                    act.meta = result[0]
                    act.title = old_meta.substring(result.index + result[0].length, old_meta.length)
                    node = cheerio.load(node.html())
                    act.authorName = node('div.zm-item-rich-text').attr('data-author-name').trim()
                    act.link = zhihuPrefix + node('div.zm-item-rich-text').attr('data-entry-url').trim()
                } 
                else if (TYPE.关注了问题.exec(act.meta) != null) 
                {
                    const old_meta = act.meta
                    const result = TYPE.关注了问题.exec(act.meta)
                    act.meta = result[0]
                    act.title = old_meta.substring(result.index + result[0].length, old_meta.length)
                    act.link = ''
                    act.authorName = ''
                } else {
                    act.meta = null
                }

                // 去除 内容 "显示全部"
                if (act.content.endsWith('显示全部')) {
                    act.content = act.content.substring(0, act.content.length - 4).trim()
                }

                // 去除 内容 "发布于"
                if (act.content.lastIndexOf('发布于') != -1 &&
                    act.content.length - act.content.lastIndexOf('发布于') == 9) {
                    act.content = act.content.substring(0, act.content.lastIndexOf('发布于'))
                }
                // 去除 内容 "发布于 昨天"
                if (act.content.lastIndexOf('发布于 昨天') != -1 &&
                    act.content.length - act.content.lastIndexOf('发布于 昨天') == 12) {
                    act.content = act.content.substring(0, act.content.lastIndexOf('发布于 昨天'))
                }
                // 去除 内容 "编辑于"
                if (act.content.lastIndexOf('编辑于') != -1 &&
                    act.content.length - act.content.lastIndexOf('编辑于') == 9) {
                    act.content = act.content.substring(0, act.content.lastIndexOf('编辑于'))
                }
                // 去除 内容 "编辑于 昨天"
                if (act.content.lastIndexOf('编辑于 昨天') != -1 &&
                    act.content.length - act.content.lastIndexOf('编辑于 昨天') == 12) {
                    act.content = act.content.substring(0, act.content.lastIndexOf('编辑于 昨天'))
                }
                if(act.meta != null)
                    act_list.push(act)
            }) // end forEach node
            callback(null, act_list)
        } 
    }) // end superagent
}