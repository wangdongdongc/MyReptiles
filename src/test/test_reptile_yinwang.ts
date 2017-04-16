import {Blog, getBlogs} from '../reptiles/yinwang'
import 'should'

describe(`yinwang: reptile`, () => {
    describe(`#getBlogs()`, () => {
        it(`should return blog list`, (done) => {
            getBlogs().then((list) => {
                list.should.be.Array()
                list.length.should.greaterThan(0)
                let blog: Blog = list[0]
                blog.should.have.property('title')
                blog.should.have.property('url')
                done()
            }).catch((err) => {
                if (err) done(err)
            })
        })
    })
})