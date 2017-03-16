import * as path from 'path'
import * as fs from 'fs'
import {srcRoot} from '../settings'

const dataRoot = path.join(srcRoot, 'data')
const historyRoot = path.join(dataRoot, 'history')

if (!fs.existsSync(dataRoot))
    fs.mkdirSync(dataRoot)
if (!fs.existsSync(historyRoot))
    fs.mkdirSync(historyRoot)

/**
 *  读取历史文件 (非异步)
 * 
 * @export
 * @param {string} filename
 * @returns {string[]}
 */
export function readHistorySync(filename: string): string[] {
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
 * 
 * @export
 * @param {string} filename
 * @param {string[]} history
 * @returns
 */
export function writeHistorySync(filename: string, history: string[]) {
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