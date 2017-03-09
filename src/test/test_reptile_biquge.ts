import {Novel, Chapter, getRecentChapters} from '../reptiles/biquge'
import 'should'

const novel: Novel = {
    name: '裁决',
    url: 'http://m.biquge.com/0_325/',
    history: {
        filename: 'test_biquge_history.json',
        maxHistory: 10,
    }
}

describe(`biquge: reptile`, () => {
    describe(`#getRecentChapters()`, () => {
        it(`should return chapter list`, (done) => {
            getRecentChapters(novel, (err, list) => {
                if (err) {done(err)}
                list.should.be.Array()
                list.length.should.greaterThan(0)
                let chapter: Chapter = list[0]
                chapter.should.have.property('title')
                chapter.should.have.property('link')
                done()
            })
        })
    })
})