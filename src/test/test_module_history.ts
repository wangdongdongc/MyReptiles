import * as path from 'path'
import * as fs from 'fs'
import 'should'
import { HistoryFile } from '../modules/history'
import { srcRoot } from '../settings'

const historyRoot = path.join(srcRoot, 'data', 'history')
const test_filename = 'test_history.json'
const test_fullpath = path.join(historyRoot, test_filename)
const test_max_items = 10

describe(`history: moduel`, () => {
    describe(`HistoryFile: class`, () => {
        it(`should exist data/history folder`, () => {
            fs.existsSync(historyRoot).should.be.true()
        })
        it(`#contain() #push() #save()`, () => {
            let history = new HistoryFile(test_filename, test_max_items)
            fs.existsSync(test_fullpath).should.be.true()
            history.contain('foo').should.be.false()
            for (let i = 0; i < 20; i++) {
                history.push(i.toString())
            }
            for (let i = 0; i < 10; i++) {
                history.contain(i.toString()).should.be.false()
            }
            for (let i = 10; i < 20; i++) {
                history.contain(i.toString()).should.be.true()
            }
            history.save()
            let reopen_history = new HistoryFile(test_filename, test_max_items)
            for (let i = 10; i < 20; i++) {
                history.contain(i.toString()).should.be.true()
            }
            fs.unlinkSync(test_fullpath) // delete test file
        })
    })
})