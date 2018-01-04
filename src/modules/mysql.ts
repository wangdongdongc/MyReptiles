import * as mysql from 'mysql'

import { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } from '../assets/auth_mysql'


/**
 * MySQL Connection Pool
 */
const pool = mysql.createPool({
    connectionLimit: 10,
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME
})

export namespace History {

    const TABLE = 'reptile.history'

    export enum Type {
        BILIBILI = 'bilibili',
        BIQUGE = 'biquge',
        TSDM = 'tsdm',
        TUICOOL = 'tuicool',
        YINWANG = 'yinwang',
        ZHIHU = 'zhihu',
    }

    export function insert(type: Type, content: string): Promise<Boolean> {
        return new Promise<Boolean>((resolve, reject) => {
            pool.query(
                `INSERT INTO ${TABLE}(type, content) VALUE ('${type}', '${content}')`
                , (err, _) => {
                    if (err) resolve(false)
                    else resolve(true)
                })
        })
    }

    export function remove(type: Type, content: string) {
        return new Promise<Boolean>((resolve, reject) => {
            pool.query(
                `DELETE FROM ${TABLE} WHERE type='${type}' AND content='${content}'`
                , (err, _) => {
                    if (err) resolve(false)
                    else resolve(true)
                })
        })
    }

    export function contain(type: Type, content: string): Promise<Boolean> {
        return new Promise<Boolean>((resolve, reject) => {
            pool.query(
                `SELECT * FROM ${TABLE} WHERE type='${type}' AND content='${content}'`
                , (err, result) => {
                    if (err) reject(err)
                    if (result.length > 0) resolve(true)
                    else resolve(false)
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
