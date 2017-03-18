import * as amqp from 'amqplib'

import * as telegram from './telegram'

import { token, chat_id } from '../assets/auth_telegram';

const MSG_QUEUE = 'message-to-telegram'
const UTF8 = 'utf8'

export enum TelegramMessageType {
    PureMessage,
    PhotoMessage
}

interface TelegramMessage {
    TYPE: TelegramMessageType
    bot_token: string
    chat_id: number
    content: string
    /**重发次数 */
    resent_times: number
}

/**Telegram 纯文本短信 */
export interface TelegramPureMessage extends TelegramMessage {
    parse_mode: string
}

/**Telegram 图片短信 */
export interface TelegramPhotoMessage extends TelegramMessage {
    photo_url: string
}

class _SendMessage {
    public forPureMessage(msg: TelegramPureMessage) {
        return new Promise((resolve, reject) => {
            telegram.sendMessage(msg.bot_token, {
                chat_id: msg.chat_id,
                text: msg.content,
                parse_mode: msg.parse_mode
            }, (err, res) => {
                if (err) {
                    reject(err)
                }
                else {
                    resolve(res)
                }
            })
        })
    }
    public forPhotoMessage(msg: TelegramPhotoMessage) {
        return new Promise((resolve, reject) => {
            telegram.sendImage({
                bot_token: msg.bot_token,
                chat_id: msg.chat_id,
                photo_url: msg.photo_url,
                caption: msg.content
            }, (err, res) => {
                if (err) {
                    reject(err)
                }
                else {
                    resolve(res)
                }
            })
        })
    }
}

/**
 * TelegramWorker (单例类)
 * 
 * 监听 telegram_message_queue 的消息，根据消息内容给 Telegram 发短信
 */
class TelegramWorker {
    /**TelegramWorker 单例 */
    private static _instance: TelegramWorker = new TelegramWorker()
    /**消息发送的最大并行数 */
    private static readonly _prefetch: number = 1
    /**最大重发次数 */
    private static readonly MAX_RESENT_TIMES = 3

    /**
     * 获取单例
     * @returns {TelegramWorker} TelegramWorker 类的单例
     */
    public static getInstance(): TelegramWorker {
        return TelegramWorker._instance
    }

    private constructor() {
        if (TelegramWorker._instance) {
            throw new Error("Error: Instantiation failed: Use TelegramWorker.getInstance() instead of new.")
        }
        TelegramWorker._instance = this
        TelegramWorker._instance.handleMessages()
    }

    /**
     * 处理队列中的消息
     */
    private handleMessages() {
        amqp.connect('amqp://localhost').then(function (conn) {
            return conn.createChannel()
        }).then(function (ch) {
            return ch.assertQueue(MSG_QUEUE).then(function (ok) {
                ch.prefetch(TelegramWorker._prefetch) //最大并行数(消息发送)
                return ch.consume(MSG_QUEUE, function (_msg) {
                    if (_msg === null) {
                        return
                    }

                    let message = <TelegramMessage>JSON.parse(_msg.content.toString(UTF8))

                    if (message.resent_times >= TelegramWorker.MAX_RESENT_TIMES) {
                        console.error(`发送失败超过3次, 放弃发送: ${message.content}`)
                        return
                    }

                    let sent = (message.TYPE === TelegramMessageType.PureMessage) ?
                        (new _SendMessage().forPureMessage(<TelegramPureMessage>message)) :
                        (new _SendMessage().forPhotoMessage(<TelegramPhotoMessage>message))

                    sent.then((res) => {
                        //
                    }).catch((err) => {
                        //重发
                        message.resent_times++
                        ch.sendToQueue(MSG_QUEUE, new Buffer(JSON.stringify(message)))
                    })
                }, {noAck: true})
            })
        }).catch(console.error)
    }
}


export function send_message_to_telegram(token:string, chat_id:number, content:string, parse_mode:string = telegram.MessageMode.markdown) {
    amqp.connect('amqp://localhost')
    .then((connection) => {
        return connection.createChannel()
    }).then((channal) => {
        return channal.assertQueue(MSG_QUEUE).then((ok) => {
            let msg: TelegramPureMessage = {
                TYPE: TelegramMessageType.PureMessage,
                bot_token: token,
                chat_id: chat_id,
                content: content,
                parse_mode: parse_mode,
                resent_times: 0
            }
            return channal.sendToQueue(MSG_QUEUE, new Buffer(JSON.stringify(msg)), UTF8)
        })
    }).catch(console.error)
}



export function send_photo_to_telegram(token: string, chat_id:number, photo_url:string, caption:string) {
    amqp.connect('amqp://localhost')
        .then((connection) => {
            return connection.createChannel()
        }).then((channal) => {
            return channal.assertQueue(MSG_QUEUE).then((ok) => {
                let msg: TelegramPhotoMessage = {
                    TYPE: TelegramMessageType.PhotoMessage,
                    bot_token: token,
                    chat_id: chat_id,
                    content: caption,
                    photo_url: photo_url,
                    resent_times: 0,
                }
                return channal.sendToQueue(MSG_QUEUE, new Buffer(JSON.stringify(msg)), UTF8)
            })
        }).catch(console.error)
}



function sendMessage(mes: string) {
    let open = amqp.connect('amqp://localhost')

    open.then(function (conn) {
        return conn.createChannel()
    }).then(function (ch) {
        return ch.assertQueue(MSG_QUEUE).then(function (ok) {
            let jsonObj: TelegramMessage = {
                TYPE: TelegramMessageType.PureMessage,
                bot_token: token.bot,
                chat_id: chat_id.me,
                content: mes,
                resent_times: 0
            }
            return ch.sendToQueue(MSG_QUEUE, new Buffer(JSON.stringify(jsonObj), UTF8))
        })
    }).catch(console.warn)
}


if (process.argv.length >= 2 && process.argv[1].indexOf('rabbitmq') != -1) {
    main(process.argv)
}
function main(argv: string[]) {
    sendMessage('1')
    sendMessage('2')
    sendMessage('3')
    sendMessage('4')
    sendMessage('5')
    sendMessage('6')
    sendMessage('7')
    sendMessage('8')
    sendMessage('9')
}