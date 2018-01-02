import * as amqp from 'amqplib'

import * as telegram from './telegram'
import { getBeijingDateStamp } from './localization'

import { token, chat_id } from '../assets/auth_telegram'

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
namespace SendMessage {
    /**
     * 使用 Telegram 发送纯文本短信
     * @param {TelegramPureMessage} msg 纯文本短信
     */
    export function forPureMessage(msg: TelegramPureMessage) {
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
    export function forPhotoMessage(msg: TelegramPhotoMessage) {
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
export class TelegramWorker {
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

                    if (message.resent_times >= TelegramWorker.MAX_RESENT_TIMES) {
                        console.error(`发送失败超过3次, 放弃发送: ${message.content}`)
                        return
                    }

                    let sent = (message.TYPE === TelegramMessageType.PureMessage) ?
                        (SendMessage.forPureMessage(<TelegramPureMessage>message)) :
                        (SendMessage.forPhotoMessage(<TelegramPhotoMessage>message))

                    sent.then((res) => {
                        // 成功发送
                    }).catch((err) => {
                        // 失败重发
                        message.resent_times++
                        channel.sendToQueue(MSG_QUEUE, new Buffer(JSON.stringify(message)))
                    })
                }, { noAck: true }) // 不使用 ack
            })
        }).catch(console.error)
    }
}

/**
 * send message to telegram bot
 * @param {string} token telegram bot token
 * @param {number} chat_id telegram chat_id
 * @param {string} content
 * @param {string} parse_mode 'html' | 'markdonw'
 */
export function send_message_to_telegram(token: string, chat_id: number, content: string, parse_mode: string = telegram.MessageMode.markdown) {
    amqp.connect('amqp://localhost')
        .then((connection) => {
            return connection.createChannel()
        })
        .then((channal) => {
            return channal.assertQueue(MSG_QUEUE).then((ok) => {
                let msg: TelegramPureMessage = {
                    TYPE: TelegramMessageType.PureMessage,
                    bot_token: token,
                    chat_id: chat_id,
                    content: content,
                    parse_mode: parse_mode,
                    resent_times: 0
                }
                return channal.sendToQueue(MSG_QUEUE, new Buffer(JSON.stringify(msg)))
            })
        })
        .catch(console.error)
}


/**
 * send photo to telegram bot
 * @param {string} token telegram bot token
 * @param {number} chat_id telegram chat_id
 * @param {string} photo_url
 * @param {string} caption caption of photo
 */
export function send_photo_to_telegram(token: string, chat_id: number, photo_url: string, caption: string) {
    amqp.connect('amqp://localhost')
        .then((connection) => {
            return connection.createChannel()
        })
        .then((channal) => {
            return channal.assertQueue(MSG_QUEUE).then((ok) => {
                let msg: TelegramPhotoMessage = {
                    TYPE: TelegramMessageType.PhotoMessage,
                    bot_token: token,
                    chat_id: chat_id,
                    content: caption,
                    photo_url: photo_url,
                    resent_times: 0,
                }
                return channal.sendToQueue(MSG_QUEUE, new Buffer(JSON.stringify(msg)))
            })
        })
        .catch(console.error)
}


export function send_mail_to_telegram(from: string, title: string, content: string) {
    let text = `*From*: ${from}\n*${title}*\n${content}\n${getBeijingDateStamp()}`
    send_message_to_telegram(token.mail, chat_id.me, text)
}


if (process.argv.length >= 2 && process.argv[1].indexOf('rabbitmq') != -1) {
    main(process.argv)
}
function main(argv: string[]) {
    send_mail_to_telegram('WDD', 'TEST', '测试一下')
    console.log(`END`)
}