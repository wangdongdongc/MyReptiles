import * as biquge from '../reptiles/biquge'
import { HistoryFile } from '../modules/history'
import { getBeijingDateStamp } from '../modules/localization'
import { send_message_to_telegram } from '../modules/rabbitmq-telegram'

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

            let history = new HistoryFile(novel.history.filename, novel.history.maxHistory)

            for (let j = 0; j < chapters.length; j++) {
                let chapter = chapters[j]

                if (history.contain(chapter.title))
                    continue

                let text = `*《${novel.name}》*更新了新章节\n[${chapter.title}](${chapter.link})`
                
                send_message_to_telegram(token.biquge, chat_id.me, text)

                history.push(chapter.title)
            }

            history.save()
        })
    }
    console.log(`${getBeijingDateStamp()} Finish Script: biquge-to-telegram`)
}