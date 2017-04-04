import * as Datastore from 'nedb'
import * as path from 'path'
import { historyRoot } from '../settings'
import { getBeijingDateStamp } from '../modules/localization'

export interface HistoryItem {
    content: string
    insert_time: string
}

export class HistoryDB {
    db: Datastore
    constructor(db_name: string) {
        this.db = new Datastore({
            filename: path.join(historyRoot, db_name),
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