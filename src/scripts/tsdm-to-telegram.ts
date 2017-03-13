import * as _ from 'underscore'

import { readHistorySync, writeHistorySync } from '../modules/history'
import { Mode, Message, sendMessage } from '../modules/telegram'
import { LightNovel, getRecentNovels } from '../reptiles/tsdm'
import { getBeijingDateStamp } from '../modules/localization';

import { token, chat_id } from '../assets/auth_telegram'

const historyFile = 'tsdm-to-telegram.json'
const maxHistory = 100

/**
 * 任务: 将天使动漫论坛"轻文社"的新帖子发送到相应 Bot
 */
export function task() {
    getRecentNovels((err: Error, novelList: LightNovel[]) => {
        if (err) { throw err }
        let history_queue = readHistorySync(historyFile)
        _.forEach(novelList, (novel: LightNovel) => {
            if (_.contains(history_queue, novel.title)) {
                //ignore
            } 
            else {
                let text = `*${novel.tag}* ${novel.title}\n${novel.link}`
                let mes: Message = {
                    chat_id: chat_id.me,
                    text: text,
                    parse_mode: Mode.markdown,
                }

                sendMessage(token.tsdm, mes, (err, res) => {
                    if (err) {
                        console.log(`#sendMessage fail: 天使动漫 ${novel.title}`);
                    }
                })

                if (history_queue.length >= maxHistory)
                    history_queue.shift()
                history_queue.push(novel.title)
            }
        })// end forEach
        writeHistorySync(historyFile, history_queue)
        console.log(`${getBeijingDateStamp()} Finish Script: tsdm-to-telegram`)
    })
}