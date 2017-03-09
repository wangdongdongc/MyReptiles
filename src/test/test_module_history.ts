import * as path from 'path'
import * as fs from 'fs'
import 'should'
import {readHistorySync, writeHistorySync} from '../modules/history'
import {srcRoot} from '../settings' 

const historyRoot = path.join(srcRoot, 'data', 'history')
const test_filename = 'test_history.json'
const test_fullpath = path.join(historyRoot, test_filename)

describe(`history: module`, () => {
    describe(`#readHistorySync()`, () => {
        it(`should exist data/history folder`, () => {
            fs.existsSync(historyRoot).should.eql(true)
        })
        it(`should return string[]`, () => {
            let result = readHistorySync(test_filename)
            result.should.be.Array()
            fs.unlinkSync(test_fullpath) // delete test file
        })
    })
    describe(`#writeHistorySync()`, () => {
        it(`should contain test string, if writing succeed`, () => {
            // write
            let test_string = (new Date()).toString()
            writeHistorySync(test_filename, [test_string])
            // read and check
            let result = readHistorySync(test_filename)
            result.should.containEql(test_string)
            // delete test file
            fs.unlinkSync(test_fullpath)
        })
    })
})