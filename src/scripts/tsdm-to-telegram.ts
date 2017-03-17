import * as telegram from '../modules/telegram'
import { readHistorySync, writeHistorySync } from '../modules/history'
import * as tsdm from '../reptiles/tsdm'
import { getBeijingDateStamp } from '../modules/localization'

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
        let history_queue = readHistorySync(historyFile)

        for (let i = 0; i < novelList.length; i++) {
            let novel = novelList[i]

            if (history_queue.indexOf(novel.title) != -1) {
                continue
            }

            let text = `*${novel.tag}* ${novel.title}\n${novel.link}`
            let mes: telegram.Message = {
                chat_id: chat_id.me,
                text: text,
                parse_mode: telegram.MessageMode.markdown,
            }

            telegram.sendMessage(token.tsdm, mes, (err, res) => {
                if (err)
                    console.error(`#sendMessage fail: 天使动漫 ${novel.title}`);
            })

            if (history_queue.length >= maxHistory)
                history_queue.shift()
            history_queue.push(novel.title)
        }

        writeHistorySync(historyFile, history_queue)
        console.log(`${getBeijingDateStamp()} Finish Script: tsdm-to-telegram`)
    })
}