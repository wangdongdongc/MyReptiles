import * as biquge from '../reptiles/biquge'
import {History} from '../modules/mysql'
import {sendMessageToRabbitMQ} from '../modules/rabbitmq-telegram'

import {token, chat_id} from '../assets/auth_telegram'
import {followingNovels} from '../assets/biquge'

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

                const historyId: History.Identifier = {
                    type: History.Type.BIQUGE,
                    content: `${novel.name}:${chapter.title}`,
                    link: chapter.link
                }

                History.contain(historyId).then(isContain => {
                    if (!isContain) {
                        History.insert(historyId).then(_ => {
                            let text = `*《${novel.name}》*更新了新章节\n[${chapter.title}](${chapter.link})`
                            sendMessageToRabbitMQ(token.biquge, chat_id.me, text, historyId)
                        })
                    }
                })
            })

        }).catch((err) => {
            console.error(`biquge#getRecentChapters(${novel.name}) fail: ${err.message}`)
        })
    })
}