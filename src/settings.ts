import * as path from 'path'

/**
 * @deprecated
 */
export const srcRoot = __dirname
export const historyRoot = path.join(path.dirname(__dirname), 'history')


if (process.argv.length >= 2 &&
    process.argv[1].indexOf('build/settings.js') != -1) {
    console.log(`srcRoot: ${srcRoot}`)
    console.log(`historyRoot: ${historyRoot}`)
}