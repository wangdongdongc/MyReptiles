import * as biquge from '../reptiles/biquge'
import { History } from '../modules/mysql'
import { send_message_to_telegram } from '../modules/rabbitmq-telegram'

import { token, chat_id } from '../assets/auth_telegram'
import { followingNovels } from '../assets/biquge'

/**
 * 任务：将笔趣阁上新的小说章节发送至相应的 Bot
 */
export function task() {
    followingNovels.forEach((novelInfo) => {

        let novel: biquge.Novel = {
            name: novelInfo.name,
            url: novelInfo.url,
            history: null
        }

        biquge.getRecentChapters(novel).then((chapter_list) => {

            chapter_list.forEach(chapter => {
                History
                .contain(History.Type.BIQUGE, chapter.title)
                .then(isContain => {
                    if (! isContain) {
                        let text = `*《${novel.name}》*更新了新章节\n[${chapter.title}](${chapter.link})`
                        send_message_to_telegram(token.biquge, chat_id.me, text)
                        History.insert(History.Type.BIQUGE, chapter.title)
                    }
                })
            })

        }).catch((err) => {
            console.error(`biquge#getRecentChapters(${novel.name}) fail: ${err.message}`)
        })
    })
}