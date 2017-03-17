import * as superagent from 'superagent'
import * as cheerio from 'cheerio'

import {Mail, sendMail} from '../modules/telegram'

/**
 * Tweet interface (yinwang)
 * 
 * @export
 * @interface Tweet
 */
export interface Tweet {
    time: string
    text: string
    image: string
}

/**
 * Blog interface (yinwang)
 * 
 * @export
 * @interface Blog
 */
export interface Blog {
    title: string
    url: string
}

const tweetURL = 'http://www.yinwang.org/tweet.html'
const blogURL = 'http://www.yinwang.org/'
const identifier = '当然我在扯淡'

export function getTweets(callback: (err: Error, tweets: Tweet[])=>void) {

}

export function getBlogs(callback: (err: Error, blogs: Blog[])=>void) {
    superagent
    .get(blogURL)
    .end((err, res) => {
        if (err) {
            callback(err, null)
        }
        if (res.text.indexOf(identifier) == -1) {
            const time = new Date()
            const mail: Mail = new Mail('王垠', 'Error', '未获取正确的HTML', `${time.toString()}`)
            sendMail(mail)
            callback(new Error('王垠: 未获取正确的HTML'), null)
        } 
        else {
            let blogList: Blog[] = []
            let $ = cheerio.load(res.text)
            let list = $('li.list-group-item.title')

            for (let i = 0; i < list.length; i++) {
                let item = list[i]

                let node = cheerio.load(item)
                let blog: Blog = {
                    title: node('a').text().toString(),
                    url: node('a').attr('href').toString()
                }

                blogList.push(blog)
            }

            callback(null, blogList)
        }
    })
}