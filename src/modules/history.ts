import * as path from 'path'
import * as fs from 'fs'

import { srcRoot } from '../settings'

const dataRoot = path.join(srcRoot, 'data')
const historyRoot = path.join(dataRoot, 'history')

if (!fs.existsSync(dataRoot))
    fs.mkdirSync(dataRoot)
if (!fs.existsSync(historyRoot))
    fs.mkdirSync(historyRoot)

/**
 *  读取历史文件 (非异步)
 * @param {string} filename 文件名
 * @returns {string[]}
 */
function readHistoryFile(filename: string): string[] {
    const historyFile = path.join(historyRoot, filename)
    if (!fs.existsSync(historyFile)) {
        fs.appendFileSync(historyFile, JSON.stringify({
            history: []
        }))
        return []
    }
    let data = JSON.parse(fs.readFileSync(historyFile).toString())
    if (data.history == undefined) {
        data.history = []
        fs.writeFileSync(historyFile, JSON.stringify(data))
    }
    return data.history
}

/**
 * 将历史信息写入历史文件 (非异步)
 * @param {string} filename 文件名
 * @param {string[]} history 字符串数组
 * @returns {string[]}
 */
function writeHistoryFile(filename: string, history: string[]) {
    // step 1: read
    const file = path.join(historyRoot, filename)
    // file not exist
    if (!fs.existsSync(file)) {
        fs.appendFileSync(file, JSON.stringify({
            history: history
        }))
        return history
    }
    let data = JSON.parse(fs.readFileSync(file).toString())
    // step 2: insert history
    data.history = history
    // step 3: write back
    fs.writeFileSync(file, JSON.stringify(data))
    return history
}

abstract class HistoryStorage {
    abstract contain(item: string): boolean
    abstract push (item: string): void
}

/**
 * 以文件对象的方式存储历史记录
 *
 * ``let history = new HistoryFile(filename, maxItems)``
 * @deprecated 已改用数据库存储历史记录
 * @export
 */
export class HistoryFile extends HistoryStorage {
    constructor(
        private filename: string,
        private max: number,
        private queue: string[] = readHistoryFile(filename)) {super()}

    public contain(item: string): boolean {
        return this.queue.indexOf(item) !== -1
    }

    public push(item: string) {
        while (this.queue.length >= this.max)
            this.queue.shift()
        this.queue.push(item)
    }

    public save() {
        writeHistoryFile(this.filename, this.queue)
    }
}


/**MAIN */
if (process.argv.length >= 2 &&
    process.argv[1].indexOf('build/modules/history.js') != -1) {
    main(process.argv)
}
function main(argv: string[]) {
    // let file = new HistoryFile('test-moduel-history-HistoryFile.json', 3)
}