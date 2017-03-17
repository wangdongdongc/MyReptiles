import * as superagent from 'superagent'

import { token, chat_id } from '../assets/auth_telegram'

export const MessageMode = {
    'markdown': 'markdown',
    'html': 'html'
}


/**
 * Message interface for telegram#sendMessage(Message)
 * 
 * @export
 * @interface Message
 */
export interface Message {
    chat_id: number
    text: string
    parse_mode: string
    disable_web_page_preview?: boolean
    disable_notification?: boolean
    reply_to_message_id?: number
}


/**
 * Mail interface for telegram#sendMail(Mail)
 * 
 * @export
 * @class Mail
 */
export class Mail {
    from: string
    to: string
    title: string
    content: string
    constructor(from: string, to: string, title: string, content: string) {
        this.from = from
        this.to = to
        this.title = title
        this.content = content
    }
    get markdown(): string {
        return `*From*:${this.from}\n*To*:${this.to}\n*${this.title}*\n${this.content}`
    }
}


/**
 * 向指定的 bot 发送信息
 * 
 * @export
 * @param {string} botToken
 * @param {Message} mes
 * @param {(err:any, res:any)=>void} callback
 */
export function sendMessage(botToken: string, mes: Message, callback: (err: any, res: any) => void) {
    let query: Message = {
        'chat_id': Math.floor(mes.chat_id),
        'text': mes.text,
        'parse_mode': mes.parse_mode,
        'disable_web_page_preview': (mes.disable_web_page_preview) ? mes.disable_web_page_preview : true,
        'disable_notification': (mes.disable_notification) ? mes.disable_notification : undefined,
        'reply_to_message_id': (mes.reply_to_message_id) ? Math.floor(mes.reply_to_message_id) : undefined
    }
    superagent
        .get(`https://api.telegram.org/bot${botToken}/sendMessage`)
        .query(query)
        .end((err, res) => {
            callback(err, res)
        })
}

/**
 * params interface for telegram.sendImage
 */
export interface ImageParams {
    bot_token: string
    chat_id: number
    photo_url: string
    caption: string
}

/**
 * 向指定的 Bot 发送图片
 * @param {string} botToken 
 * @param {string} imageURL 
 * @param {function} callback 
 */
export function sendImage(params: ImageParams, callback: (err, res) => void) {
    superagent
        .get(`https://api.telegram.org/bot${params.bot_token}/sendPhoto`)
        .query({
            chat_id: params.chat_id,
            photo: params.photo_url,
            caption: params.caption
        })
        .end((err, res) => {
            callback(err, res)
        })
}


/**
 * 向 sssoa_mail_bot 发送邮件
 * 
 * @export
 * @param {Mail} mail
 * @param {string} [mailToken=token.mail]
 */
export function sendMail(mail: Mail, mailToken: string = token.mail) {
    const message: Message = {
        'chat_id': chat_id.me,
        'text': mail.markdown,
        'parse_mode': MessageMode.markdown
    }
    sendMessage(mailToken, message, (err, res) => {
        if (err) { throw err }
    })
}