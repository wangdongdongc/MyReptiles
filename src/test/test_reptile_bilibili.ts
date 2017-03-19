import { getRecentFeeds } from '../reptiles/bilibili'
import 'should'

describe(`bilibili: reptile`, () => {
    describe(`#getRecentFeeds`, () => {
        it(`should return feeds`, (done) => {
            getRecentFeeds((err, feeds) => {
                if (err) done(err)
                feeds.should.be.Array()
                feeds.length.should.greaterThan(0)
                let feed = feeds[0]
                feed.should.have.property('author')
                feed.should.have.property('title')
                feed.should.have.property('description')
                feed.should.have.property('pic')
                feed.should.have.property('link')
                done()
            })
        })
    })
})