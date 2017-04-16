import {Article, getRecentArticles} from '../reptiles/tuicool'
import 'should'

describe(`tuicool: reptile`, () => {
    describe(`#getRecentArticles()`, () => {
        it(`should return Article list`, (done) => {
            getRecentArticles().then((list) => {
                list.should.be.Array()
                list.length.should.greaterThan(0)
                let art: Article = list[0]
                art.should.have.property('title')
                art.should.have.property('cut')
                art.should.have.property('thumb')
                art.should.have.property('link')
                done()
            }).catch((err) => {
                if (err) done(err)
            })
        })
    })
})