import * as mysql from 'mysql'

import { DB_HOST, DB_USER, DB_PASSWORD } from '../assets/auth_mysql'


/**
 * MySQL Connection
 */
const mysqlConn = mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: 'reptile'
})
mysqlConn.connect(err => {
    if (err) console.error('数据库连接失败', err)
})

export namespace History {

    const TABLE = 'reptile.history'

    export enum Type {
        bilibili = 'bilibili',
        biquge = 'biquge',
        tsdm = 'tsdm',
        tuicool = 'tuicool',
        yinwang = 'yinwang',
        zhihu = 'zhihu'
    }

    export function insert(type: Type, content: string): Promise<Boolean> {
        return new Promise<Boolean>((resolve, reject) => {
            mysqlConn.query(
                `INSERT INTO ${TABLE}(type, content) VALUE ('${type}', '${content}')`
                , (err, _) => {
                    if (err) resolve(false)
                    else resolve(true)
                })
        })
    }

    export function remove(type: Type, content: string) {
        return new Promise<Boolean>((resolve, reject) => {
            mysqlConn.query(
                `DELETE FROM ${TABLE} WHERE type='${type}' AND content='${content}'`
                , (err, _) => {
                    if (err) resolve(false)
                    else resolve(true)
                })
        })
    }

    export function contain(type: Type, content: string): Promise<Boolean> {
        return new Promise<Boolean>((resolve, reject) => {
            mysqlConn.query(
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
    mysqlConn.connect(err => {
        if (err) throw err
        mysqlConn.query(`SELECT * FROM reptile.history WHERE type='bilibili' AND content='1'`, (err, result) => {
            if (err) throw err
            console.log('TEST SELECT:', result)
        })
        mysqlConn.query(`INSERT INTO reptile.history(type, content)
    VALUE ('bilibili', '6')`, (err, result) => {
                if (err) throw err
                console.log('TEST INSERT:', result)
            })
    })
}
