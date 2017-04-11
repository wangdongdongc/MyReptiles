import * as tsdm from '../reptiles/tsdm'
// import { HistoryFile } from '../modules/history'
import { HistoryDB } from '../modules/nedb'

import { send_message_to_telegram } from '../modules/rabbitmq-telegram'

import { token, chat_id } from '../assets/auth_telegram'

const historyFile = 'tsdm-to-telegram.json'
// const maxHistory = 200

/**
 * 任务: 将天使动漫论坛"轻文社"的新帖子发送到相应 Bot
 */
export function task() {

    let history = new HistoryDB(historyFile)

    tsdm.getRecentNovels().then((novel_list) => {
        novel_list.forEach((novel) => {
            history.contain(novel.title).then((isExist) => {
                if (! isExist) {
                    let text = `*${novel.tag}* ${novel.title}\n${novel.link}`
                    send_message_to_telegram(token.tsdm, chat_id.me, text)
                    history.insert(novel.title)
                }
            })
        })
    }).catch((err) => {
        console.error(`tsdm#getRecentNovels fail: ${err.message}`)
    })
}


/**
 * @debug
 */
if (process.argv.length >= 2 &&
    process.argv[1].indexOf('build/scripts/tsdm-to-telegram.js') != -1) {
    task()
}