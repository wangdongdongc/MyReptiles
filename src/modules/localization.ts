/**
 * 获取北京时区(UTC+8)的当前时间
 * @return {Date} 北京时间
 */
export function getBeijingDate(): Date {
    return toBeijingDate(new Date())
}


/**
 * 将时区对象转换为取北京时区(UTC+8)的时间对象(需要计算时区偏差)
 * @return {Date} 北京时间
 */

export function toBeijingDate(date: Date): Date {
    const localTime = date.getTime()
    const localOffset = date.getTimezoneOffset() * 60000 // 获得当地时间偏移的毫秒数

    const utc = localTime + localOffset // utc即GMT时间
    const offset = 8 // 北京(UTC+8)

    const beijing = utc + (3600000 * offset)
    return new Date(beijing)
}

/**
 * 获取北京时区(UTC+8)的时间戳(字符串)
 * @return {string} 北京时间戳
 */
export function getBeijingDateStamp(): string {
    return getBeijingDate().toLocaleString()
}