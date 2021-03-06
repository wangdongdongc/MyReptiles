import {MessageMode, Message, sendMessage} from '../modules/telegram'
import {token, chat_id} from '../assets/auth_telegram'
import 'should'

let mes: Message = {
    'chat_id': chat_id.me,
    'text': `正在执行测试`,
    'parse_mode': MessageMode.markdown
}

describe(`telegram: module`, () => {
    describe(`#sendMessage()`, () => {
        it(`should return 'res.ok == true'`, (done) => {
            sendMessage(token.bot, mes, (err, res) => {
                if (err) done(err)
                else {
                    res.should.have.property('ok')
                    res.ok.should.eql(true)
                    done()
                }
            })
        })
    })
})
