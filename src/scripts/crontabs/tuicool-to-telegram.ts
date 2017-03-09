import {readHistorySync, writeHistorySync} from '../../modules/history'
import {Mode, Message, sendMessage} from '../../modules/telegram'
import {token, chat_id} from '../../assets/auth_telegram'
import {Article, getRecentArticles} from '../../reptiles/tuicool'
import * as _ from 'underscore'

const historyFile = 'tuicool-to-telegram.json'
const maxHistory = 200

export function task() {
    getRecentArticles((err: Error, artList: Article[]) => {
        if (err) { throw err }
        let history_queue = readHistorySync(historyFile)
        _.forEach(artList, (article) => {
            if (_.contains(history_queue, article.title)) {
                // ignore
            } else {
                const mes: Message = {
                    chat_id: chat_id.me,
                    text: `*${article.title}*\n${article.link}\n${article.cut}`,
                    parse_mode: Mode.markdown,
                }
                sendMessage(token.tuibool, mes, (err, res) => {
                    if (err) { throw err } // Todo: catch error and log
                })
                if (history_queue.length >= maxHistory)
                    history_queue.shift()
                history_queue.push(article.title)
            }
        }) // end forEach
        writeHistorySync(historyFile, history_queue)
        console.log(`Finish Script: tuicool-to-telegram (crontab)`)
    })
}