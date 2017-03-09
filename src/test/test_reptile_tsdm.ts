import {LightNovel, getRecentNovels} from '../reptiles/tsdm'
import 'should'

describe(`tsdm: reptile`, () => {
    describe(`#getRecentNovels`, () => {
        it(`should return novel list`, (done) => {
            getRecentNovels((err, list) => {
                if (err) {done(err)}
                list.should.be.Array()
                list.length.should.greaterThan(0)
                let novel: LightNovel = list[0]
                novel.should.have.property('title')
                novel.should.have.property('link')
                novel.should.have.property('tag')
                done()
            })
        })
    })
})