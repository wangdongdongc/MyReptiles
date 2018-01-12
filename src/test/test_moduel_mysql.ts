import 'should'

import { History } from '../modules/mysql'

const TEST_TYPE: History.Type = History.Type.BILIBILI
const TEST_CONTENT: string = new Date().toString()

const TEST_IDENTIFIER: History.Identifier = { type: TEST_TYPE, content: TEST_CONTENT }

describe(`mysql: module`, () => {
    describe(`History: 使用 MySQL 实现历史记录功能 (reptile.history)`, () => {
        it(`#insert`, (done) => {
            History.insert(TEST_IDENTIFIER)
            .then(_ => done())
            .catch(err => done(err))
        })
        it(`#contain`, (done) => {
            History.contain({type: TEST_TYPE, content: TEST_CONTENT})
            .then(result => result === true ? done() : done(new Error('未找到测试数据')))
            .catch(err => done(err))
        })
        it(`#updateStatus`, (done) => {
            History.updateStatus(TEST_IDENTIFIER, History.Status.SOLVED)
            .then(result => result === true ? done() : done(new Error('未成功设置状态')))
            .catch(err => done(err))
        })
        it(`#remove`, (done) => {
            History.remove({ type: TEST_TYPE, content: TEST_CONTENT })
            .then(_ => {
                History.contain({ type: TEST_TYPE, content: TEST_CONTENT })
                .then(result => result === false ? done() : done(new Error('未能成功删除测试数据')))
                .catch(err => done(err))
            })
            .catch(err => done(err))
        })
    })
})