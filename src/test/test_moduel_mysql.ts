import 'should'

import { History } from '../modules/mysql';

const TEST_TYPE: History.Type = History.Type.bilibili
const TEST_CONTENT: string = new Date().toString()

describe(`mysql: module`, () => {
    describe(`History: 使用 MySQL 实现历史记录功能`, () => {
        it(`#insert`, (done) => {
            History.insert(TEST_TYPE, TEST_CONTENT)
            .then(_ => done())
            .catch(err => done(err))
        })
        it(`#contain`, (done) => {
            History.contain(TEST_TYPE, TEST_CONTENT)
            .then(result => result === true ? done() : done(new Error('未找到测试数据')))
            .catch(err => done(err))
        })
        it(`#remove`, (done) => {
            History.remove(TEST_TYPE, TEST_CONTENT)
            .then(_ => {
                History.contain(TEST_TYPE, TEST_CONTENT)
                .then(result => result === false ? done() : done(new Error('未能成功删除测试数据')))
                .catch(err => done(err))
            })
            .catch(err => done(err))
        })
    })
})