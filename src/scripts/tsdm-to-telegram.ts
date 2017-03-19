import * as tsdm from '../reptiles/tsdm'
import { HistoryFile } from '../modules/history'
import { getBeijingDateStamp } from '../modules/localization'
import { send_message_to_telegram } from '../modules/rabbitmq-telegram'

import { token, chat_id } from '../assets/auth_telegram'

const historyFile = 'tsdm-to-telegram.json'
const maxHistory = 100

/**
 * 任务: 将天使动漫论坛"轻文社"的新帖子发送到相应 Bot
 */
export function task() {
    tsdm.getRecentNovels((err: Error, novelList: tsdm.LightNovel[]) => {
        if (err) {
            console.error(`tsdm#getRecentNovels fail: ${err.message}`)
            return
        }

        let history = new HistoryFile(historyFile, maxHistory)

        novelList
            .filter((novel) => {
                return !history.contain(novel.title)
            })
            .forEach((novel) => {
                let text = `*${novel.tag}* ${novel.title}\n${novel.link}`
                send_message_to_telegram(token.tsdm, chat_id.me, text)
                history.push(novel.title)
            })

        history.save()
        console.log(`${getBeijingDateStamp()} Finish Script: tsdm-to-telegram`)
    })
}


/**
 * @debug
 */
if (process.argv.length >= 2 &&
    process.argv[1].indexOf('build/scripts/tsdm-to-telegram.js') != -1) {
    task()
}