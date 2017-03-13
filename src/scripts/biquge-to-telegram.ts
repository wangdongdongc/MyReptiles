import { readHistorySync, writeHistorySync } from '../modules/history'
import { Mode, Message, sendMessage } from '../modules/telegram'
import { token, chat_id } from '../assets/auth_telegram'
import { novels } from '../assets/biquge';
import { Novel, NovelInfo, Chapter, getRecentChapters } from '../reptiles/biquge'
import { getBeijingDateStamp } from '../modules/localization';
import * as _ from 'underscore'


/**
 * 爬取笔趣阁的小说并发送至 Telegram Bot
 */
export function task() {
    _.forEach(novels, (novelInfo: NovelInfo) => {

        let novel: Novel = {
            name: novelInfo.name,
            url: novelInfo.url,
            history: {
                maxHistory: 50,
                filename: novelInfo.historyFile
            }
        }

        getRecentChapters(novel, (err, chapters: Chapter[]) => {
            if (err) { 
                throw err 
            }

            let history_queue = readHistorySync(novel.history.filename)

            _.forEach(chapters, (chapter: Chapter) => {
                if (_.contains(history_queue, chapter.title)) {
                    //ignore
                } 
                else {

                    let text = `*《${novel.name}》*更新了新章节\n[${chapter.title}](${chapter.link})`
                    let mes: Message = {
                        chat_id: chat_id.me,
                        text: text,
                        parse_mode: Mode.markdown
                    }

                    sendMessage(token.biquge, mes, (err, res) => {
                        // Todo: log error
                        if (err) {
                            console.log(`#sendMessage fail: 笔趣阁 《${novel.name}》${chapter.title}`);
                        }
                    })
                    
                    if (history_queue.length >= novel.history.maxHistory)
                        history_queue.shift()
                    history_queue.push(chapter.title)
                }
            })
            writeHistorySync(novel.history.filename, history_queue)
        })
    })
    console.log(`${getBeijingDateStamp()} Finish Script: biquge-to-telegram`)
}