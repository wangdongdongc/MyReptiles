import * as amqp from 'amqplib'

import * as telegram from './telegram'
import { getBeijingDateStamp } from './localization'

import { token, chat_id } from '../assets/auth_telegram'
import { History } from './mysql'

const MSG_QUEUE = 'message-to-telegram'
const UTF8 = 'utf8'

/**telegram 短信的类型: PureMessage | PhotoMessage */
export enum TelegramMessageType {
    PureMessage,
    PhotoMessage
}

abstract class TelegramMessage {
    TYPE: TelegramMessageType
    bot_token: string
    chat_id: number
    content: string
    /**重发次数 */
    resent_times: number

    /**[可选] 提供给 RabbitMQ Worker 消息的标示 */
    identifier?: History.Identifier
}

/**Telegram 纯文本短信 */
export class TelegramPureMessage extends TelegramMessage {
    parse_mode: string
}

/**Telegram 图片短信 */
export class TelegramPhotoMessage extends TelegramMessage {
    photo_url: string
}


/**
 * 使用 Telegram 发送短信
 *
 * 应根据短信的类型选取不同的发送方法 (从而调用不同的 Telegram Bot API)
 *
 * e.g. 发送图片短信 ``SendMessage.forPhotoMessage(photomsg)``
 */
namespace Telegram {
    /**
     * 使用 Telegram 发送纯文本短信
     * @param {TelegramPureMessage} msg 纯文本短信
     */
    export function sendPureMessage(msg: TelegramPureMessage) {
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

    /**
     * 使用 Telegram 发送图片短信
     * @param {TelegramPhotoMessage} msg 图片短信
     */
    export function sendPhotoMessage(msg: TelegramPhotoMessage) {
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
 * RabbitMQWorker: 监听消息队列，根据消息内容给 Telegram 发短信
 */
export class RabbitMQWorker {
    /**最大重发次数 */
    private static readonly MAX_RESENT_TIMES = 3

    constructor(
        private worker_name = '',
        private readonly create_date_time = new Date()
    ) {
        amqp.connect('amqp://localhost').then(function (connection) {
            return connection.createChannel()
        }).then(function (channel) {
            return channel.assertQueue(MSG_QUEUE).then(function (ok) {
                return channel.consume(MSG_QUEUE, function (_msg) {
                    if (_msg === null) {
                        return
                    }

                    let message = <TelegramMessage>JSON.parse(_msg.content.toString(UTF8))

                    if (message.resent_times >= RabbitMQWorker.MAX_RESENT_TIMES) {
                        if (message.identifier) {
                            History.updateStatus(message.identifier, History.Status.UN_SOLVED)
                        }
                        return
                    }

                    let sent = (message.TYPE === TelegramMessageType.PureMessage) ?
                        (Telegram.sendPureMessage(<TelegramPureMessage>message)) :
                        (Telegram.sendPhotoMessage(<TelegramPhotoMessage>message))

                    sent.then((res) => {
                        // 成功发送
                        if (message.identifier) {
                            History.updateStatus(message.identifier, History.Status.SOLVED)
                        }
                    }).catch((err) => {
                        // 失败重发(将消息重新放回队列)
                        message.resent_times++
                        channel.sendToQueue(MSG_QUEUE, new Buffer(JSON.stringify(message)))
                    })
                }, { noAck: true }) // 不使用 ack
            })
        }).catch(console.error)
    }
}

/**
 * 将普通文字消息发送到 RabbitMQ
 * @param {string} token telegram bot token
 * @param {number} chatId telegram chat_id
 * @param {string} content
 * @param {History.Identifier} identifier
 * @param {string} parseMode 'html' | 'markdown'
 */
export function sendMessageToRabbitMQ(token: string, chatId: number, content: string, identifier: History.Identifier = null, parseMode: string = telegram.MessageMode.markdown) {
    amqp.connect('amqp://localhost')
        .then((connection) => {
            return connection.createChannel()
        })
        .then((channal) => {
            return channal.assertQueue(MSG_QUEUE).then((ok) => {
                let msg: TelegramPureMessage = {
                    TYPE: TelegramMessageType.PureMessage,
                    bot_token: token,
                    chat_id: chatId,
                    content: content,
                    parse_mode: parseMode,
                    resent_times: 0,
                    identifier: identifier
                }
                return channal.sendToQueue(MSG_QUEUE, new Buffer(JSON.stringify(msg)))
            })
        })
        .catch(console.error)
}


/**
 * 将图片消息发送到 RabbitMQ
 * @param {string} token telegram bot token
 * @param {number} chatId telegram chat id
 * @param {string} photoUrl
 * @param {string} caption caption of photo
 * @param {History.Identifier} identifier
 */
export function sendPhotoMsgToRabbitMQ(token: string, chatId: number, photoUrl: string, caption: string, identifier: History.Identifier = null) {
    amqp.connect('amqp://localhost')
        .then((connection) => {
            return connection.createChannel()
        })
        .then((channal) => {
            return channal.assertQueue(MSG_QUEUE).then((ok) => {
                let msg: TelegramPhotoMessage = {
                    TYPE: TelegramMessageType.PhotoMessage,
                    bot_token: token,
                    chat_id: chatId,
                    content: caption,
                    photo_url: photoUrl,
                    resent_times: 0,
                    identifier: identifier
                }
                return channal.sendToQueue(MSG_QUEUE, new Buffer(JSON.stringify(msg)))
            })
        })
        .catch(console.error)
}

/**
 * 将邮件消息发送到 RabbitMQ
 * @param {string} from 发送人
 * @param {string} title 标题
 * @param {string} content 内容
 */
export function sendMailToRabbitMQ(from: string, title: string, content: string) {
    let text = `*From*: ${from}\n*${title}*\n${content}\n${getBeijingDateStamp()}`
    sendMessageToRabbitMQ(token.mail, chat_id.me, text)
}


if (process.argv.length >= 2 && process.argv[1].indexOf('rabbitmq') != -1) {
    main(process.argv)
}
function main(argv: string[]) {
    sendMailToRabbitMQ('WDD', 'TEST', '测试一下')
    console.log(`END`)
}