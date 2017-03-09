import {readHistorySync, writeHistorySync} from '../../modules/history'
import {Mode, Message, sendMessage} from '../../modules/telegram'
import {token, chat_id} from '../../assets/auth_telegram'
import {Novel, Chapter, getRecentChapters} from '../../reptiles/biquge'
import * as _ from 'underscore'

interface NovelInfo {
    name: string
    url: string
    historyFile: string
}

const novels: NovelInfo[] = [
    {
        name: '裁决',
        url: 'http://m.biquge.com/0_325/',
        historyFile: 'biquge-to-telegram--cai_jue.json'
    },
    {
        name: '赘婿',
        url: 'http://m.biquge.com/0_285/',
        historyFile: 'biquge-to-telegram--zhui_xu.json'
    },
    {
        name: '五行天',
        url: 'http://m.biquge.com/11_11298/',
        historyFile: 'biquge-to-telegram--wu_xing_tian.json'
    },
    {
        name: '萌娘神话世界',
        url: 'http://m.biquge.com/35_35348/',
        historyFile: 'biquge-to-telegram--meng_niang_shsj.json'
    }
]

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
            if (err) { throw err }
            let history_queue = readHistorySync(novel.history.filename)
            _.forEach(chapters, (chapter: Chapter) => {
                if (_.contains(history_queue, chapter.title)) {
                    //
                } else {
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
    console.log(`Finish Script: biquge-to-telegram (crontab)`)
}