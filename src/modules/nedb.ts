import * as Datastore from 'nedb'
import * as path from 'path'
import * as fs from 'fs'
import { historyRoot } from '../settings'
import { getBeijingDateStamp } from '../modules/localization'


/**
 * @todo 受文件系统权限所致, mkdir 在 supervisor 进程下无法执行
 * @param {string} file full path of history file
 */
function create_file(file: string) {
    if (! fs.existsSync(historyRoot))
        fs.mkdirSync(historyRoot)
    if (! fs.existsSync(file)) {
        fs.appendFileSync(file, '')
    }
}

export interface HistoryItem {
    content: string
    insert_time: string
}

export class HistoryDB {
    db: Datastore
    constructor(db_name: string) {
        let file = path.join(historyRoot, db_name)
        create_file(file)
        this.db = new Datastore({
            filename: file,
            autoload: true
        })
    }

    contain(content: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this.db.count({
                content: content
            }, (err, num) => {
                if (err) reject(err)
                else {
                    if (num != 0) resolve(true)
                    else resolve(false)
                }
            })
        })
    }

    insert(content: string): Promise<HistoryItem> {
        return new Promise<HistoryItem>((resolve, reject) => {
            this.db.insert({
                content: content,
                insert_time: getBeijingDateStamp()
            }, (err, doc) => {
                if (err) reject(err)
                else resolve(doc)
            })
        })
    }
}