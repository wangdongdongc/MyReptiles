import {User, Activity, getRecentActivities} from '../reptiles/zhihu'
import 'should'

const user: User = {
    name: 'vczh',
    activity_page: 'https://www.zhihu.com/people/excited-vczh',
    identifier: 'vczh',
    historyFile: 'zhihu-to-telegram--vczh.json'
}

describe(`zhihu: reptile`, () => {
    describe(`#getRecentActivities()`, () => {
        it(`should return activity list`, (done) => {
            getRecentActivities(user).then((list) => {
                list.should.be.Array()
                list.length.should.greaterThan(0)
                let act: Activity = list[0]
                act.should.have.property('meta')
                act.should.have.property('title')
                act.should.have.property('link')
                act.should.have.property('authorName')
                act.should.have.property('content')
                done()
            }).catch((err) => {
                if (err) done(err)
            })
        })
    })
})