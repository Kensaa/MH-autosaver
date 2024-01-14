import * as fs from 'fs'
import * as archiver from 'archiver'
import { createHash } from 'crypto'

export function getDateString() {
    const date = new Date()
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear().toString()
    return `${day}-${month}-${year}`
}

export function getTimeString() {
    const date = new Date()
    const hour = date.getHours().toString().padStart(2, '0')
    const minute = date.getMinutes().toString().padStart(2, '0')
    const second = date.getSeconds().toString().padStart(2, '0')
    return `${hour}-${minute}-${second}`
}

export function checkFolder(folder: string) {
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder)
    }
}

export function zipDirectory(sourceDir: string, outPath: string) {
    const archive = archiver('zip', { zlib: { level: 9 } })
    const stream = fs.createWriteStream(outPath)

    return new Promise<void>((resolve, reject) => {
        archive
            .directory(sourceDir, false)
            .on('error', err => reject(err))
            .pipe(stream)

        stream.on('close', () => resolve())
        archive.finalize()
    })
}

export function getHash(src: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        const stream = fs.createReadStream(src)
        const hash = createHash('md5')
        stream.on('end', () => resolve(hash.digest('hex')))
        stream.on('error', err => reject(err))
        stream.pipe(hash)
    })
}
