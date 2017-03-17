import * as telegram from '../modules/telegram'
import { readHistorySync, writeHistorySync } from '../modules/history'
import * as biquge from '../reptiles/biquge'
import { getBeijingDateStamp } from '../modules/localization'

import { token, chat_id } from '../assets/auth_telegram'
import { followingNovels } from '../assets/biquge'

/**
 * 任务：将笔趣阁上新的小说章节发送至相应的 Bot
 */
export function task() {
    for (let i = 0; i < followingNovels.length; i++) {
        let novelInfo = followingNovels[i]

        let novel: biquge.Novel = {
            name: novelInfo.name,
            url: novelInfo.url,
            history: {
                maxHistory: 50,
                filename: novelInfo.historyFile
            }
        }

        biquge.getRecentChapters(novel, (err, chapters: biquge.Chapter[]) => {
            if (err) {
                console.error(`biquge#getRecentChapters(${novel.name}) fail: ${err.message}`)
                return
            }

            let history_queue = readHistorySync(novel.history.filename)

            for (let j = 0; j < chapters.length; j++) {
                let chapter = chapters[j]

                if (history_queue.indexOf(chapter.title) != -1) {
                    continue
                }

                let text = `*《${novel.name}》*更新了新章节\n[${chapter.title}](${chapter.link})`
                let mes: telegram.Message = {
                    chat_id: chat_id.me,
                    text: text,
                    parse_mode: telegram.MessageMode.markdown
                }

                telegram.sendMessage(token.biquge, mes, (err, res) => {
                    if (err)
                        console.error(`biquge#sendMessage fail: 《${novel.name}》${chapter.title}`);
                })

                if (history_queue.length >= novel.history.maxHistory)
                    history_queue.shift()
                history_queue.push(chapter.title)
            }

            writeHistorySync(novel.history.filename, history_queue)
        })
    }
    console.log(`${getBeijingDateStamp()} Finish Script: biquge-to-telegram`)
}