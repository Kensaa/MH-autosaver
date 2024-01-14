import * as os from 'os'
import * as fs from 'fs'
import * as path from 'path'
import { checkFolder, getDateString, getHash, getTimeString, zipDirectory } from './utils'
import { spawn } from 'child_process'

const homeFolder = os.homedir()
const saveFolder =
    os.platform() === 'win32'
        ? path.join(homeFolder, 'AppData', 'Roaming', 'mh-autosave')
        : path.join(homeFolder, '.mh-autosave')

const steamFolder =
    os.platform() === 'win32'
        ? path.join('C:', 'Program Files (x86)', 'Steam', 'userdata')
        : path.join(homeFolder, '.steam', 'steam', 'userdata')

const configPath = path.join(saveFolder, 'config.json')

checkFolder(saveFolder)
checkFolder(path.join(saveFolder, 'saves'))

const defaultConfig = {
    saveLocation: path.join(saveFolder, 'saves'),
    steamLocation: steamFolder,
    disabledGames: [] as string[]
}
type Config = typeof defaultConfig

let config: Config
if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 4))
    config = { ...defaultConfig }
} else {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8')) as Config
}

checkFolder(config.saveLocation)

const games = [
    {
        name: 'Monster Hunter World',
        executable: 'MonsterHunterWorld.exe',
        id: '582010'
    },
    {
        name: 'Monster Hunter Rise',
        executable: 'MonsterHunterRise.exe',
        id: '1446780'
    }
]

const gameFolders: Record<string, string> = {}

for (const game of games) {
    for (const weirdFolder of fs.readdirSync(config.steamLocation)) {
        const weirdFolderpath = path.join(config.steamLocation, weirdFolder)

        if (!fs.statSync(weirdFolderpath).isDirectory()) continue
        if (!fs.existsSync(path.join(weirdFolderpath, game.id))) continue

        gameFolders[game.id] = path.join(weirdFolderpath, game.id)
    }
}

const args = process.argv.slice(2)

if (args.length < 1) {
    process.exit(1)
}

const [executable, ...cmdArgs] = args

spawn(executable, cmdArgs).on('close', async () => {
    const game = games.find(g => g.executable === path.basename(executable))

    if (!game) {
        process.exit(1)
    }

    if (config.disabledGames.includes(game.id)) {
        process.exit(0)
    }

    const gameFolder = gameFolders[game.id]

    const dayFolder = path.join(config.saveLocation, getDateString())
    checkFolder(dayFolder)
    const gameDayFolder = path.join(dayFolder, game.name)
    checkFolder(gameDayFolder)

    const zipFile = path.join(gameDayFolder, `${getTimeString()}.zip`)
    await zipDirectory(gameFolder, zipFile)

    const dayFiles = fs.readdirSync(dayFolder)
    const dayZips = dayFiles.filter(f => f.endsWith('.zip')).filter(f => f !== path.basename(zipFile))

    const hashes: Record<string, string> = {}
    for (const zip of dayZips) {
        const zipPath = path.join(dayFolder, zip)
        const hash = await getHash(zipPath)
        hashes[zip] = hash
    }

    const currentHash = await getHash(zipFile)

    for (const [zip, hash] of Object.entries(hashes)) {
        if (hash === currentHash) {
            fs.rmSync(zipFile)
        }
    }
})
