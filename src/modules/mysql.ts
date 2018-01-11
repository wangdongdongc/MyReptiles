import * as mysql from 'mysql'

import { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } from '../assets/auth_mysql'


/**
 * MySQL Connection Pool
 */
const pool = mysql.createPool({
    connectionLimit: 20,
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME
})

export namespace History {

    const TABLE = 'reptile.history'

    /** 记录的状态 */
    export enum Status {
        /** 状态未知 */
        UNKNOWN = 'unknown',
        /** 记录已发送(至Telegram) */
        SOLVED = 'solved'
        /** 记录未成功发送(至Telegram) */,
        UN_SOLVED = 'unsolved',
    }

    /** 历史记录的类型 */
    export enum Type {
        BILIBILI = 'bilibili',
        BIQUGE = 'biquge',
        TSDM = 'tsdm',
        TUICOOL = 'tuicool',
        YINWANG = 'yinwang',
        ZHIHU = 'zhihu',
    }

    /** 标识符用于定位到数据库里的一条历史记录 */
    export interface Identifier {
        type: Type,
        content: string,
        /** 超链接（如果有的话） */
        link?: string
    }

    export function insert(id: Identifier): Promise<Boolean> {
        return new Promise<Boolean>((resolve, reject) => {
            let sql
            if (id.link) {
                sql = `INSERT INTO ${TABLE}(type, content, link) VALUE ('${id.type}', '${id.content}', '${id.link}')`
            } else {
                sql = `INSERT INTO ${TABLE}(type, content) VALUE ('${id.type}', '${id.content}')`
            }
            pool.query(
                sql
                , (err, _) => {
                    if (err) resolve(false)
                    else resolve(true)
                })
        })
    }

    export function remove(id: Identifier) {
        return new Promise<Boolean>((resolve, reject) => {
            pool.query(
                `DELETE FROM ${TABLE} WHERE type='${id.type}' AND content='${id.content}'`
                , (err, _) => {
                    if (err) resolve(false)
                    else resolve(true)
                })
        })
    }

    export function contain(id: Identifier): Promise<Boolean> {
        return new Promise<Boolean>((resolve, reject) => {
            pool.query(
                `SELECT * FROM ${TABLE} WHERE type='${id.type}' AND content='${id.content}'`
                , (err, result) => {
                    if (err) {
                        reject(err)
                        return
                    }
                    if (result.length && result.length > 0) resolve(true)
                    else resolve(false)
                })
        })
    }

    export function updateStatus(id: Identifier, status: Status): Promise<Boolean> {
        return new Promise<Boolean>((resolve, reject) => {
            pool.query(
                `UPDATE ${TABLE} SET status='${status}' WHERE type='${id.type}' AND content='${id.content}'`,
                (err, result) => {
                    if (err) resolve(false)
                    else resolve(true)
                })
        })
    }
}



/**MAIN */
if (process.argv.length >= 2 &&
    process.argv[1].indexOf('build/modules/mysql.js') != -1) {
    pool.query(`SELECT * FROM reptile.history WHERE type='bilibili' AND content='1'`
        , (err, result) => {
            if (err) throw err
            console.log('TEST SELECT:', result)
        })
    pool.query(`INSERT INTO reptile.history(type, content)
    VALUE ('bilibili', '6')`
        , (err, result) => {
            if (err) throw err
            console.log('TEST INSERT:', result)
        })
}
